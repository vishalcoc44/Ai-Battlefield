import { supabase } from '../lib/supabase';

export interface Community {
	id: string;
	name: string;
	description: string;
	creator_id: string;
	is_locked: boolean;
	invite_code: string;
	max_members: number;
	created_at: string;
	updated_at?: string;
	member_count?: number;
	user_role?: 'creator' | 'admin' | 'member';
}

export interface CommunityMember {
	id: string;
	community_id: string;
	user_id: string;
	role: 'creator' | 'admin' | 'member';
	joined_at: string;
	username?: string;
	email?: string;
}

export interface CommunityInvite {
	id: string;
	community_id: string;
	invite_code: string;
	created_by: string;
	expires_at?: string;
	max_uses?: number;
	current_uses: number;
	created_at: string;
}

// ============================================================================
// COMMUNITY OPERATIONS
// ============================================================================

export const getUserCommunities = async (userId: string): Promise<Community[]> => {
	const { data, error } = await supabase
		.from('community_members')
		.select(`
			role,
			communities (
				id,
				name,
				description,
				creator_id,
				is_locked,
				invite_code,
				max_members,
				created_at,
				updated_at
			)
		`)
		.eq('user_id', userId);

	if (error) {
		console.error('Error fetching user communities:', error);
		return [];
	}

	return data?.map(item => ({
		...item.communities,
		user_role: item.role
	})) || [];
};

export const getAvailableCommunities = async (): Promise<Community[]> => {
	const { data, error } = await supabase
		.from('communities')
		.select(`
			*,
			member_count:community_members(count)
		`)
		.eq('is_locked', false)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching available communities:', error);
		return [];
	}

	return data || [];
};

export const createCommunity = async (
	userId: string,
	name: string,
	description: string,
	isLocked: boolean = false
): Promise<Community | null> => {
	// Generate unique invite code
	const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

	const { data, error } = await supabase
		.from('communities')
		.insert({
			name,
			description,
			creator_id: userId,
			is_locked: isLocked,
			invite_code: inviteCode,
		})
		.select()
		.single();

	if (error) {
		console.error('Error creating community:', error);
		return null;
	}

	// Add creator as member with creator role
	await supabase
		.from('community_members')
		.insert({
			community_id: data.id,
			user_id: userId,
			role: 'creator'
		});

	return data;
};

export const joinCommunity = async (
	communityId: string,
	userId: string,
	inviteCode?: string
): Promise<boolean> => {
	// Check if community requires invite and validate code
	if (inviteCode) {
		const { data: inviteData, error: inviteError } = await supabase
			.from('community_invites')
			.select('*')
			.eq('invite_code', inviteCode)
			.eq('community_id', communityId)
			.gt('expires_at', new Date().toISOString())
			.single();

		if (inviteError || !inviteData) {
			console.error('Invalid or expired invite code');
			return false;
		}
	}

	const { error } = await supabase
		.from('community_members')
		.insert({
			community_id: communityId,
			user_id: userId,
			role: 'member'
		});

	if (error) {
		console.error('Error joining community:', error);
		return false;
	}

	return true;
};

export const leaveCommunity = async (
	communityId: string,
	userId: string
): Promise<boolean> => {
	const { error } = await supabase
		.from('community_members')
		.delete()
		.eq('community_id', communityId)
		.eq('user_id', userId);

	if (error) {
		console.error('Error leaving community:', error);
		return false;
	}

	return true;
};

export const updateCommunity = async (
	communityId: string,
	updates: {
		name?: string;
		description?: string;
		is_locked?: boolean;
		max_members?: number;
	}
): Promise<boolean> => {
	const { error } = await supabase
		.from('communities')
		.update(updates)
		.eq('id', communityId);

	if (error) {
		console.error('Error updating community:', error);
		return false;
	}

	return true;
};

export const deleteCommunity = async (communityId: string): Promise<boolean> => {
	const { error } = await supabase
		.from('communities')
		.delete()
		.eq('id', communityId);

	if (error) {
		console.error('Error deleting community:', error);
		return false;
	}

	return true;
};

// ============================================================================
// MEMBER MANAGEMENT
// ============================================================================

export const getCommunityMembers = async (communityId: string): Promise<CommunityMember[]> => {
	const { data, error } = await supabase
		.from('community_members')
		.select(`
			id,
			user_id,
			role,
			joined_at,
			profiles!inner(username, full_name)
		`)
		.eq('community_id', communityId);

	if (error) {
		console.error('Error fetching community members:', error);
		return [];
	}

	return data?.map(member => ({
		id: member.id,
		community_id: communityId,
		user_id: member.user_id,
		role: member.role,
		joined_at: member.joined_at,
		username: member.profiles?.username,
		email: member.profiles?.full_name || 'Unknown User'
	})) || [];
};

export const updateMemberRole = async (
	communityId: string,
	userId: string,
	newRole: 'creator' | 'admin' | 'member'
): Promise<boolean> => {
	const { error } = await supabase
		.from('community_members')
		.update({ role: newRole })
		.eq('community_id', communityId)
		.eq('user_id', userId);

	if (error) {
		console.error('Error updating member role:', error);
		return false;
	}

	return true;
};

export const removeMember = async (
	communityId: string,
	userId: string
): Promise<boolean> => {
	const { error } = await supabase
		.from('community_members')
		.delete()
		.eq('community_id', communityId)
		.eq('user_id', userId);

	if (error) {
		console.error('Error removing member:', error);
		return false;
	}

	return true;
};

// ============================================================================
// INVITE MANAGEMENT
// ============================================================================

export const createInvite = async (
	communityId: string,
	createdBy: string,
	expiresInDays: number = 7,
	maxUses?: number
): Promise<CommunityInvite | null> => {
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + expiresInDays);

	const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

	const { data, error } = await supabase
		.from('community_invites')
		.insert({
			community_id: communityId,
			invite_code: inviteCode,
			created_by: createdBy,
			expires_at: expiresAt.toISOString(),
			max_uses: maxUses,
		})
		.select()
		.single();

	if (error) {
		console.error('Error creating invite:', error);
		return null;
	}

	return data;
};

export const getCommunityInvites = async (communityId: string): Promise<CommunityInvite[]> => {
	const { data, error } = await supabase
		.from('community_invites')
		.select('*')
		.eq('community_id', communityId)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching invites:', error);
		return [];
	}

	return data || [];
};

// ============================================================================
// CONTENT FILTERING
// ============================================================================

export const getCommunityScopedPredictions = async (
	userId: string,
	includeGlobal: boolean = true
): Promise<any[]> => {
	// Get user's community IDs
	const { data: memberships } = await supabase
		.from('community_members')
		.select('community_id')
		.eq('user_id', userId);

	const communityIds = memberships?.map(m => m.community_id) || [];

	let query = supabase
		.from('predictions')
		.select('*')
		.order('created_at', { ascending: false });

	if (includeGlobal && communityIds.length > 0) {
		query = query.or(`community_id.is.null,community_id.in.(${communityIds.join(',')})`);
	} else if (includeGlobal) {
		query = query.is('community_id', null);
	} else if (communityIds.length > 0) {
		query = query.in('community_id', communityIds);
	} else {
		return []; // No communities and no global content requested
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching scoped predictions:', error);
		return [];
	}

	return data || [];
};

export const getCommunityScopedDebates = async (
	userId: string,
	includeGlobal: boolean = true
): Promise<any[]> => {
	// Get user's community IDs
	const { data: memberships } = await supabase
		.from('community_members')
		.select('community_id')
		.eq('user_id', userId);

	const communityIds = memberships?.map(m => m.community_id) || [];

	let query = supabase
		.from('group_debates')
		.select('*')
		.eq('status', 'active')
		.order('created_at', { ascending: false });

	if (includeGlobal && communityIds.length > 0) {
		query = query.or(`community_id.is.null,community_id.in.(${communityIds.join(',')})`);
	} else if (includeGlobal) {
		query = query.is('community_id', null);
	} else if (communityIds.length > 0) {
		query = query.in('community_id', communityIds);
	} else {
		return []; // No communities and no global content requested
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching scoped debates:', error);
		return [];
	}

	return data || [];
};
