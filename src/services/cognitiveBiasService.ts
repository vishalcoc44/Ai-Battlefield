import { supabase } from '../lib/supabase';

export interface CognitiveBias {
	id: string;
	user_id: string;
	bias_type: string;
	bias_name: string;
	score: number;
	color: string;
	description: string;
	example_text: string;
	debate_id?: string;
	detected_at: string;
}

export const getUserCognitiveBiases = async (userId: string): Promise<CognitiveBias[]> => {
	const { data, error } = await supabase
		.from('cognitive_biases')
		.select('*')
		.eq('user_id', userId)
		.order('detected_at', { ascending: false });

	if (error) {
		console.error('Error fetching cognitive biases:', error);
		return [];
	}

	return data || [];
};

export const getUserBiasStats = async (userId: string) => {
	const biases = await getUserCognitiveBiases(userId);

	// Group by bias type and calculate average scores
	const biasGroups = biases.reduce((acc, bias) => {
		if (!acc[bias.bias_type]) {
			acc[bias.bias_type] = {
				name: bias.bias_name,
				type: bias.bias_type,
				color: bias.color,
				description: bias.description,
				scores: [],
				examples: [],
				count: 0
			};
		}

		acc[bias.bias_type].scores.push(bias.score);
		acc[bias.bias_type].examples.push({
			text: bias.example_text,
			date: bias.detected_at
		});
		acc[bias.bias_type].count++;

		return acc;
	}, {} as Record<string, any>);

	// Calculate averages and sort
	const result = Object.values(biasGroups).map((group: any) => ({
		...group,
		averageScore: group.scores.reduce((sum: number, score: number) => sum + score, 0) / group.scores.length,
		recentExample: group.examples[0] // Most recent
	})).sort((a, b) => b.averageScore - a.averageScore);

	return {
		totalBiases: biases.length,
		activeBiases: result.filter(b => b.averageScore > 0.3).length,
		biasGroups: result
	};
};

export const createCognitiveBias = async (
	userId: string,
	biasType: string,
	biasName: string,
	score: number,
	color: string,
	description: string,
	exampleText: string,
	debateId?: string
): Promise<boolean> => {
	const { error } = await supabase
		.from('cognitive_biases')
		.insert({
			user_id: userId,
			bias_type: biasType,
			bias_name: biasName,
			score,
			color,
			description,
			example_text: exampleText,
			debate_id: debateId
		});

	if (error) {
		console.error('Error creating cognitive bias:', error);
		return false;
	}

	return true;
};
