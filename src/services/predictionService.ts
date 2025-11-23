import { supabase } from '../lib/supabase';

export interface Prediction {
	id: string;
	user_id: string;
	question: string;
	category: string;
	probability: number;
	community_probability?: number;
	deadline: string;
	resolved: boolean;
	outcome?: boolean;
	brier_score?: number;
	created_at: string;
	resolved_at?: string;
}

// ============================================================================
// PREDICTION OPERATIONS
// ============================================================================

export const getUserPredictions = async (userId: string): Promise<Prediction[]> => {
	const { data, error } = await supabase
		.from('predictions')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching predictions:', error);
		return [];
	}

	return data || [];
};

export const getOpenPredictions = async (): Promise<Prediction[]> => {
	const { data, error } = await supabase
		.from('predictions')
		.select('*')
		.eq('resolved', false)
		.order('deadline', { ascending: true });

	if (error) {
		console.error('Error fetching open predictions:', error);
		return [];
	}

	return data || [];
};

export const createPrediction = async (
	userId: string,
	question: string,
	category: string,
	probability: number,
	deadline: string
): Promise<Prediction | null> => {
	const { data, error } = await supabase
		.from('predictions')
		.insert({
			user_id: userId,
			question,
			category,
			probability,
			deadline,
		})
		.select()
		.single();

	if (error) {
		console.error('Error creating prediction:', error);
		return null;
	}

	return data;
};

export const updatePrediction = async (
	predictionId: string,
	probability: number
): Promise<boolean> => {
	const { error } = await supabase
		.from('predictions')
		.update({ probability })
		.eq('id', predictionId);

	if (error) {
		console.error('Error updating prediction:', error);
		return false;
	}

	return true;
};

export const resolvePrediction = async (
	predictionId: string,
	outcome: boolean
): Promise<boolean> => {
	// Get prediction
	const { data: prediction } = await supabase
		.from('predictions')
		.select('*')
		.eq('id', predictionId)
		.single();

	if (!prediction) return false;

	// Calculate Brier score
	const brierScore = Math.pow(prediction.probability - (outcome ? 1 : 0), 2);

	const { error } = await supabase
		.from('predictions')
		.update({
			resolved: true,
			outcome,
			brier_score: brierScore,
			resolved_at: new Date().toISOString(),
		})
		.eq('id', predictionId);

	if (error) {
		console.error('Error resolving prediction:', error);
		return false;
	}

	// Update user's overall Brier score
	await updateUserBrierScore(prediction.user_id);

	return true;
};

// ============================================================================
// CALIBRATION STATS
// ============================================================================

export const getUserBrierScore = async (userId: string): Promise<number> => {
	const { data, error } = await supabase
		.from('predictions')
		.select('brier_score')
		.eq('user_id', userId)
		.eq('resolved', true)
		.not('brier_score', 'is', null);

	if (error || !data || data.length === 0) {
		return 0.5; // Default score
	}

	const avgBrier =
		data.reduce((sum, p) => sum + (p.brier_score || 0), 0) / data.length;

	return avgBrier;
};

export const updateUserBrierScore = async (userId: string): Promise<boolean> => {
	const brierScore = await getUserBrierScore(userId);

	// Calculate calibration rank
	let calibrationRank = 'Novice';
	if (brierScore < 0.1) calibrationRank = 'Superforecaster';
	else if (brierScore < 0.2) calibrationRank = 'Expert';
	else if (brierScore < 0.3) calibrationRank = 'Advanced';
	else if (brierScore < 0.4) calibrationRank = 'Intermediate';

	const { error } = await supabase
		.from('profiles')
		.update({
			brier_score: brierScore,
			calibration_rank: calibrationRank,
		})
		.eq('id', userId);

	if (error) {
		console.error('Error updating user Brier score:', error);
		return false;
	}

	return true;
};

export const getPredictionStats = async (userId: string) => {
	const predictions = await getUserPredictions(userId);
	const resolved = predictions.filter(p => p.resolved);
	const brierScore = await getUserBrierScore(userId);

	return {
		total: predictions.length,
		resolved: resolved.length,
		pending: predictions.length - resolved.length,
		brierScore,
		calibrationRank: brierScore < 0.1 ? 'Superforecaster' : 'Forecaster',
	};
};
