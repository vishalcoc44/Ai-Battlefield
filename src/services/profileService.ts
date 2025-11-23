import { supabase } from '../lib/supabase';

export interface UserProfile {
	id: string;
	username: string;
	level: number;
	xp: number;
	total_debates: number;
	views_changed: number;
	brier_score: number;
	calibration_rank: string;
	total_predictions: number;
	calm_score: number;
	total_training_sessions: number;
	rank_percentile?: number;
	is_verified: boolean;
	public_resume_url?: string;
	created_at: string;
	updated_at: string;
}

export interface CognitiveSkill {
	id: string;
	user_id: string;
	skill_name: string;
	level: number;
	color: string;
	created_at: string;
	updated_at: string;
}

export interface Achievement {
	id: string;
	code: string;
	title: string;
	description: string;
	icon: string;
	requirement_type: string;
	requirement_count: number;
}

export interface UserAchievement {
	id: string;
	user_id: string;
	achievement_id: string;
	achievement?: Achievement;
	unlocked_at: string;
}

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single();

	if (error) {
		console.error('Error fetching user profile:', error);
		return null;
	}

	return data;
};

export const updateUserProfile = async (
	userId: string,
	updates: Partial<UserProfile>
): Promise<boolean> => {
	const { error } = await supabase
		.from('profiles')
		.update(updates)
		.eq('id', userId);

	if (error) {
		console.error('Error updating user profile:', error);
		return false;
	}

	return true;
};

export const incrementUserXP = async (userId: string, xpGain: number): Promise<boolean> => {
	const profile = await getUserProfile(userId);
	if (!profile) return false;

	const newXP = profile.xp + xpGain;
	const newLevel = Math.floor(newXP / 100) + 1; // Simple leveling: 100 XP per level

	return updateUserProfile(userId, { xp: newXP, level: newLevel });
};

// ============================================================================
// COGNITIVE SKILLS
// ============================================================================

export const getUserSkills = async (userId: string): Promise<CognitiveSkill[]> => {
	const { data, error } = await supabase
		.from('cognitive_skills')
		.select('*')
		.eq('user_id', userId);

	if (error) {
		console.error('Error fetching cognitive skills:', error);
		return [];
	}

	return data || [];
};

export const updateSkillLevel = async (
	userId: string,
	skillName: string,
	newLevel: number
): Promise<boolean> => {
	const { error } = await supabase
		.from('cognitive_skills')
		.upsert({
			user_id: userId,
			skill_name: skillName,
			level: Math.min(100, Math.max(0, newLevel)),
		});

	if (error) {
		console.error('Error updating skill level:', error);
		return false;
	}

	return true;
};

export const initializeDefaultSkills = async (userId: string): Promise<boolean> => {
	const defaultSkills = [
		{ skill_name: 'Steel-manning', level: 0, color: '#4CAF50' },
		{ skill_name: 'De-escalation', level: 0, color: '#2196F3' },
		{ skill_name: 'Fact-checking', level: 0, color: '#FFC107' },
		{ skill_name: 'Cognitive Flex', level: 0, color: '#9C27B0' },
	];

	const skillsWithUserId = defaultSkills.map(skill => ({
		...skill,
		user_id: userId,
	}));

	const { error } = await supabase
		.from('cognitive_skills')
		.upsert(skillsWithUserId, { onConflict: 'user_id,skill_name' });

	if (error) {
		console.error('Error initializing default skills:', error);
		return false;
	}

	return true;
};

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export const getAllAchievements = async (): Promise<Achievement[]> => {
	const { data, error } = await supabase
		.from('achievements')
		.select('*');

	if (error) {
		console.error('Error fetching achievements:', error);
		return [];
	}

	return data || [];
};

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
	const { data, error } = await supabase
		.from('user_achievements')
		.select(`
      *,
      achievement:achievements(*)
    `)
		.eq('user_id', userId);

	if (error) {
		console.error('Error fetching user achievements:', error);
		return [];
	}

	return data || [];
};

export const unlockAchievement = async (
	userId: string,
	achievementCode: string
): Promise<boolean> => {
	// Get achievement by code
	const { data: achievement } = await supabase
		.from('achievements')
		.select('id')
		.eq('code', achievementCode)
		.single();

	if (!achievement) return false;

	const { error } = await supabase
		.from('user_achievements')
		.insert({
			user_id: userId,
			achievement_id: achievement.id,
		});

	if (error) {
		console.error('Error unlocking achievement:', error);
		return false;
	}

	return true;
};
