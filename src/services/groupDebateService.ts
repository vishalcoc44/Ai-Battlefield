import { supabase } from '../lib/supabase';

export interface GroupDebate {
	id: string;
	topic: string;
	created_by?: string;
	status: 'active' | 'closed' | 'archived';
	max_participants: number;
	is_anonymous: boolean;
	is_featured: boolean;
	intensity_level?: 'Low' | 'Medium' | 'High' | 'Extreme';
	category?: string;
	ends_at?: string;
	created_at: string;
}

export interface GroupDebateParticipant {
	id: string;
	debate_id: string;
	user_id: string;
	anonymous_mask_id?: string;
	joined_at: string;
	left_at?: string;
}

export interface GroupDebateMessage {
	id: string;
	debate_id: string;
	user_id?: string;
	sender_name: string;
	sender_type: 'user' | 'ai' | 'system';
	content: string;
	reply_to_id?: string;
	created_at: string;
}

// ============================================================================
// GROUP DEBATE OPERATIONS
// ============================================================================

export const getActiveGroupDebates = async (
	includeAnonymous = true
): Promise<GroupDebate[]> => {
	let query = supabase
		.from('group_debates')
		.select('*')
		.eq('status', 'active')
		.order('created_at', { ascending: false });

	if (!includeAnonymous) {
		query = query.eq('is_anonymous', false);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching group debates:', error);
		return [];
	}

	return data || [];
};

export const getFeaturedDebate = async (): Promise<GroupDebate | null> => {
	const { data, error } = await supabase
		.from('group_debates')
		.select('*')
		.eq('status', 'active')
		.eq('is_featured', true)
		.order('created_at', { ascending: false })
		.limit(1)
		.single();

	if (error) {
		console.error('Error fetching featured debate:', error);
		return null;
	}

	return data;
};

export const createGroupDebate = async (
	userId: string,
	topic: string,
	options: {
		isAnonymous?: boolean;
		isFeatured?: boolean;
		intensityLevel?: GroupDebate['intensity_level'];
		category?: string;
		maxParticipants?: number;
		endsAt?: string;
	} = {}
): Promise<GroupDebate | null> => {
	const { data, error } = await supabase
		.from('group_debates')
		.insert({
			topic,
			created_by: userId,
			is_anonymous: options.isAnonymous || false,
			is_featured: options.isFeatured || false,
			intensity_level: options.intensityLevel,
			category: options.category,
			max_participants: options.maxParticipants || 10,
			ends_at: options.endsAt,
		})
		.select()
		.single();

	if (error) {
		console.error('Error creating group debate:', error);
		return null;
	}

	return data;
};

export const getDebateParticipantCount = async (debateId: string): Promise<number> => {
	const { count, error } = await supabase
		.from('group_debate_participants')
		.select('*', { count: 'exact', head: true })
		.eq('debate_id', debateId)
		.is('left_at', null);

	if (error) {
		console.error('Error counting participants:', error);
		return 0;
	}

	return count || 0;
};

// ============================================================================
// PARTICIPANT OPERATIONS
// ============================================================================

export const joinGroupDebate = async (
	userId: string,
	debateId: string,
	anonymousMaskId?: string
): Promise<boolean> => {
	const { error } = await supabase
		.from('group_debate_participants')
		.insert({
			debate_id: debateId,
			user_id: userId,
			anonymous_mask_id: anonymousMaskId,
		});

	if (error) {
		console.error('Error joining group debate:', error);
		return false;
	}

	return true;
};

export const leaveGroupDebate = async (
	userId: string,
	debateId: string
): Promise<boolean> => {
	const { error } = await supabase
		.from('group_debate_participants')
		.update({ left_at: new Date().toISOString() })
		.eq('debate_id', debateId)
		.eq('user_id', userId);

	if (error) {
		console.error('Error leaving group debate:', error);
		return false;
	}

	return true;
};

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

export const getDebateMessages = async (
	debateId: string,
	limit = 50
): Promise<GroupDebateMessage[]> => {
	const { data, error } = await supabase
		.from('group_debate_messages')
		.select('*')
		.eq('debate_id', debateId)
		.order('created_at', { ascending: true })
		.limit(limit);

	if (error) {
		console.error('Error fetching debate messages:', error);
		return [];
	}

	return data || [];
};

export const sendDebateMessage = async (
	debateId: string,
	userId: string,
	senderName: string,
	content: string,
	senderType: GroupDebateMessage['sender_type'] = 'user',
	replyToId?: string
): Promise<GroupDebateMessage | null> => {
	const { data, error } = await supabase
		.from('group_debate_messages')
		.insert({
			debate_id: debateId,
			user_id: userId,
			sender_name: senderName,
			sender_type: senderType,
			content,
			reply_to_id: replyToId,
		})
		.select()
		.single();

	if (error) {
		console.error('Error sending debate message:', error);
		return null;
	}

	return data;
};

// ============================================================================
// REALTIME SUBSCRIPTIONS
// ============================================================================

export const subscribeToDebateMessages = (
	debateId: string,
	onMessage: (message: GroupDebateMessage) => void
) => {
	return supabase
		.channel(`debate:${debateId}`)
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'group_debate_messages',
				filter: `debate_id=eq.${debateId}`,
			},
			(payload) => {
				onMessage(payload.new as GroupDebateMessage);
			}
		)
		.subscribe();
};

export const subscribeToParticipantChanges = (
	debateId: string,
	onChange: (participant: GroupDebateParticipant) => void
) => {
	return supabase
		.channel(`participants:${debateId}`)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'group_debate_participants',
				filter: `debate_id=eq.${debateId}`,
			},
			(payload) => {
				onChange(payload.new as GroupDebateParticipant);
			}
		)
		.subscribe();
};
