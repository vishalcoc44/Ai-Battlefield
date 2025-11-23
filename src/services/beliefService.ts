import { supabase } from '../lib/supabase';

export interface Belief {
	id: string;
	user_id: string;
	topic: string;
	icon: string;
	initial_confidence: number;
	current_confidence: number;
	status: 'shifted' | 'shattered' | 'reinforced' | 'evolving';
	last_debate_at?: string;
	created_at: string;
	updated_at: string;
}

export interface BeliefChange {
	id: string;
	belief_id: string;
	user_id: string;
	topic: string;
	before_stance?: string;
	after_stance?: string;
	confidence_before: number;
	confidence_after: number;
	debate_id?: string;
	changed_at: string;
}

// ============================================================================
// BELIEF OPERATIONS
// ============================================================================

export const getUserBeliefs = async (userId: string): Promise<Belief[]> => {
	const { data, error } = await supabase
		.from('beliefs')
		.select('*')
		.eq('user_id', userId)
		.order('updated_at', { ascending: false });

	if (error) {
		console.error('Error fetching beliefs:', error);
		return [];
	}

	return data || [];
};

export const createBelief = async (
	userId: string,
	topic: string,
	initialConfidence: number,
	icon = 'lightbulb'
): Promise<Belief | null> => {
	const { data, error } = await supabase
		.from('beliefs')
		.insert({
			user_id: userId,
			topic,
			icon,
			initial_confidence: initialConfidence,
			current_confidence: initialConfidence,
			status: 'evolving',
		})
		.select()
		.single();

	if (error) {
		console.error('Error creating belief:', error);
		return null;
	}

	return data;
};

export const updateBeliefConfidence = async (
	beliefId: string,
	newConfidence: number,
	debateId?: string
): Promise<boolean> => {
	// Get current belief
	const { data: belief } = await supabase
		.from('beliefs')
		.select('*')
		.eq('id', beliefId)
		.single();

	if (!belief) return false;

	// Calculate confidence change
	const change = Math.abs(newConfidence - belief.current_confidence);
	let status: Belief['status'] = 'evolving';

	if (change > 0.5) {
		status = 'shattered';
	} else if (change > 0.2) {
		status = 'shifted';
	} else if (newConfidence > belief.current_confidence) {
		status = 'reinforced';
	}

	// Update belief
	const { error: updateError } = await supabase
		.from('beliefs')
		.update({
			current_confidence: newConfidence,
			status,
			last_debate_at: new Date().toISOString(),
		})
		.eq('id', beliefId);

	if (updateError) {
		console.error('Error updating belief:', updateError);
		return false;
	}

	// Record belief change
	await recordBeliefChange(
		beliefId,
		belief.user_id,
		belief.topic,
		belief.current_confidence,
		newConfidence,
		debateId
	);

	return true;
};

// ============================================================================
// BELIEF CHANGE HISTORY
// ============================================================================

export const recordBeliefChange = async (
	beliefId: string,
	userId: string,
	topic: string,
	confidenceBefore: number,
	confidenceAfter: number,
	debateId?: string,
	beforeStance?: string,
	afterStance?: string
): Promise<boolean> => {
	const { error } = await supabase
		.from('belief_changes')
		.insert({
			belief_id: beliefId,
			user_id: userId,
			topic,
			before_stance: beforeStance,
			after_stance: afterStance,
			confidence_before: confidenceBefore,
			confidence_after: confidenceAfter,
			debate_id: debateId,
		});

	if (error) {
		console.error('Error recording belief change:', error);
		return false;
	}

	return true;
};

export const getBeliefChangeHistory = async (
	userId: string
): Promise<BeliefChange[]> => {
	const { data, error } = await supabase
		.from('belief_changes')
		.select('*')
		.eq('user_id', userId)
		.order('changed_at', { ascending: false });

	if (error) {
		console.error('Error fetching belief change history:', error);
		return [];
	}

	return data || [];
};

export const getBeliefStats = async (userId: string) => {
	const beliefs = await getUserBeliefs(userId);
	const changes = await getBeliefChangeHistory(userId);

	return {
		totalBeliefs: beliefs.length,
		viewsChanged: changes.filter(
			c => Math.abs(c.confidence_after - c.confidence_before) > 0.3
		).length,
		averageConfidenceChange:
			changes.reduce((sum, c) => sum + Math.abs(c.confidence_after - c.confidence_before), 0) /
			(changes.length || 1),
	};
};
