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
	participant_count?: number;
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
	includeAnonymous = true,
	userId?: string
): Promise<GroupDebate[]> => {
	let query = supabase
		.from('group_debates')
		.select('*')
		.eq('status', 'active');

	// Temporarily disabled community filtering until database is updated
	// TODO: Re-enable community filtering once community_id column is added to group_debates table

	if (!includeAnonymous) {
		query = query.eq('is_anonymous', false);
	}

	const { data, error } = await query.order('created_at', { ascending: false });

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
		.maybeSingle();

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

export const updateGroupDebate = async (
	debateId: string,
	updates: {
		topic?: string;
		status?: GroupDebate['status'];
		maxParticipants?: number;
		isAnonymous?: boolean;
		isFeatured?: boolean;
		intensityLevel?: GroupDebate['intensity_level'];
		category?: string;
		endsAt?: string;
	}
): Promise<GroupDebate | null> => {
	// Build update object with proper null checks
	const updateData: any = {};

	if (updates.topic !== undefined) updateData.topic = updates.topic;
	if (updates.status !== undefined) updateData.status = updates.status;
	if (updates.maxParticipants !== undefined) updateData.max_participants = updates.maxParticipants;
	if (updates.isAnonymous !== undefined) updateData.is_anonymous = updates.isAnonymous;
	if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
	if (updates.intensityLevel !== undefined) updateData.intensity_level = updates.intensityLevel;
	if (updates.category !== undefined) updateData.category = updates.category;
	if (updates.endsAt !== undefined) updateData.ends_at = updates.endsAt;

	// Check if there's anything to update
	if (Object.keys(updateData).length === 0) {
		console.warn('No fields to update in group debate');
		return null;
	}

	const { data, error } = await supabase
		.from('group_debates')
		.update(updateData)
		.eq('id', debateId)
		.select()
		.single();

	if (error) {
		console.error('Error updating group debate:', error);
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

export const isUserParticipatingInDebate = async (
	debateId: string,
	userId: string
): Promise<boolean> => {
	const { data, error } = await supabase
		.from('group_debate_participants')
		.select('id')
		.eq('debate_id', debateId)
		.eq('user_id', userId)
		.is('left_at', null)
		.maybeSingle();

	if (error) {
		console.error('Error checking participation:', error);
		return false;
	}

	return !!data;
};

export const joinGroupDebate = async (
	debateId: string,
	userId: string,
	anonymousMaskId?: string
): Promise<boolean> => {
	const { error } = await supabase
		.from('group_debate_participants')
		.upsert(
			{
				debate_id: debateId,
				user_id: userId,
				anonymous_mask_id: anonymousMaskId,
				left_at: null, // Ensure they're marked as active
			},
			{
				onConflict: 'debate_id,user_id',
			}
		);

	if (error) {
		console.error('Error joining group debate:', error);
		return false;
	}

	return true;
};

export const leaveGroupDebate = async (
	debateId: string,
	userId: string
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

export const getGroupDebateMessages = async (
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

export const sendGroupDebateMessage = async (
	debateId: string,
	userId: string,
	content: string,
	senderType: GroupDebateMessage['sender_type'] = 'user',
	replyToId?: string
): Promise<GroupDebateMessage | null> => {
	// Get user's display name
	let senderName = 'User';
	if (senderType === 'user' && userId) {
		const { data: profile } = await supabase
			.from('profiles')
			.select('username')
			.eq('id', userId)
			.single();

		senderName = profile?.username || 'User';
	}

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

export const subscribeToGroupDebateMessages = (
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
