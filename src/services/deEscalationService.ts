import { supabase } from '../lib/supabase';
import { getGeminiModel } from './gemini';

export interface DeEscalationSession {
	id: string;
	user_id: string;
	scenario_type: string;
	initial_calm_score: number;
	final_calm_score?: number;
	responses_count: number;
	positive_responses: number;
	negative_responses: number;
	completed: boolean;
	created_at: string;
	completed_at?: string;
}

export interface DeEscalationResponse {
	id: string;
	session_id: string;
	user_response: string;
	ai_prompt: string;
	sentiment_analysis: {
		calm_words: string[];
		aggressive_words: string[];
		score: number;
	};
	created_at: string;
}

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

export const createDeEscalationSession = async (
	userId: string,
	scenarioType: string,
	initialCalmScore: number
): Promise<DeEscalationSession | null> => {
	const { data, error } = await supabase
		.from('deescalation_sessions')
		.insert({
			user_id: userId,
			scenario_type: scenarioType,
			initial_calm_score: initialCalmScore,
		})
		.select()
		.single();

	if (error) {
		console.error('Error creating de-escalation session:', error);
		return null;
	}

	return data;
};

export const getDeEscalationSession = async (sessionId: string): Promise<DeEscalationSession | null> => {
	const { data, error } = await supabase
		.from('deescalation_sessions')
		.select('*')
		.eq('id', sessionId)
		.single();

	if (error) {
		console.error('Error fetching de-escalation session:', error);
		return null;
	}

	return data;
};

export const completeDeEscalationSession = async (
	sessionId: string,
	finalCalmScore: number,
	responsesCount: number,
	positiveResponses: number,
	negativeResponses: number
): Promise<boolean> => {
	const { error } = await supabase
		.from('deescalation_sessions')
		.update({
			final_calm_score: finalCalmScore,
			responses_count: responsesCount,
			positive_responses: positiveResponses,
			negative_responses: negativeResponses,
			completed: true,
			completed_at: new Date().toISOString(),
		})
		.eq('id', sessionId);

	if (error) {
		console.error('Error completing de-escalation session:', error);
		return false;
	}

	// Update user's overall calm score
	await updateUserCalmScore(sessionId);

	return true;
};

// ============================================================================
// RESPONSE OPERATIONS
// ============================================================================

export const saveDeEscalationResponse = async (
	sessionId: string,
	userResponse: string,
	aiPrompt: string,
	sentimentAnalysis: any
): Promise<DeEscalationResponse | null> => {
	const { data, error } = await supabase
		.from('deescalation_responses')
		.insert({
			session_id: sessionId,
			user_response: userResponse,
			ai_prompt: aiPrompt,
			sentiment_analysis: sentimentAnalysis,
		})
		.select()
		.single();

	if (error) {
		console.error('Error saving de-escalation response:', error);
		return null;
	}

	return data;
};

export const getSessionResponses = async (sessionId: string): Promise<DeEscalationResponse[]> => {
	const { data, error } = await supabase
		.from('deescalation_responses')
		.select('*')
		.eq('session_id', sessionId)
		.order('created_at', { ascending: true });

	if (error) {
		console.error('Error fetching session responses:', error);
		return [];
	}

	return data || [];
};

// ============================================================================
// AI INTEGRATION
// ============================================================================

export const generateTrollResponse = async (
	userResponse: string,
	conversationHistory: string[],
	calmScore: number
): Promise<string> => {
	try {
		const model = getGeminiModel();

		const historyText = conversationHistory.length > 0
			? `\n\nConversation history:\n${conversationHistory.map((msg, i) => `${i % 2 === 0 ? 'User' : 'Troll'}: ${msg}`).join('\n')}`
			: '';

		const escalationLevel = calmScore < 0.3 ? 'highly aggressive' :
							   calmScore < 0.7 ? 'moderately frustrated' : 'mildly annoyed';

		const prompt = `
You are an angry internet troll in a debate. The user just responded: "${userResponse}"

Current user calm score: ${(calmScore * 100).toFixed(0)}% (lower = more agitated)
Your current mood: ${escalationLevel}

${historyText}

Respond as an internet troll who is getting increasingly frustrated. Make it provocative but not completely unhinged. Keep it 1-2 sentences. Your goal is to test the user's de-escalation skills.

Examples of troll responses:
- "That's literally the dumbest thing I've ever heard. Are you even trying?"
- "You clearly have no idea what you're talking about. Go back to school."
- "This is why I hate debating with idiots like you."`;

		const result = await model.generateContent(prompt);
		const response = result.response;
		const text = response.text();

		return text.trim();
	} catch (error) {
		console.error('Error generating troll response:', error);
		return "You're clearly not getting this. How can you be so wrong about something so obvious?";
	}
};

export const analyzeResponseCalmness = async (response: string): Promise<{
	calm_words: string[];
	aggressive_words: string[];
	score: number;
}> => {
	try {
		const model = getGeminiModel();

		const prompt = `
Analyze this response for calmness in a debate context: "${response}"

Return a JSON object with:
{
  "calm_words": ["list", "of", "calm", "words", "found"],
  "aggressive_words": ["list", "of", "aggressive", "words", "found"],
  "score": 0.0 to 1.0 (1.0 = very calm, 0.0 = very aggressive)
}

Calm indicators: "understand", "agree", "respect", "consider", "appreciate", "valid", "point", "perspective", "thanks", "sorry"
Aggressive indicators: "wrong", "stupid", "idiot", "dumb", "hate", "ridiculous", "pathetic", "arrogant", "condescending"`;

		const result = await model.generateContent(prompt);
		const responseText = result.response;
		const text = responseText.text();

		try {
			return JSON.parse(text);
		} catch {
			// Fallback analysis
			const calmWords = ['understand', 'agree', 'respect', 'consider', 'appreciate', 'valid', 'point', 'perspective', 'thanks', 'sorry'];
			const aggressiveWords = ['wrong', 'stupid', 'idiot', 'dumb', 'hate', 'ridiculous', 'pathetic'];

			const foundCalmWords = calmWords.filter(word => response.toLowerCase().includes(word));
			const foundAggressiveWords = aggressiveWords.filter(word => response.toLowerCase().includes(word));

			let score = 0.5; // neutral default
			score += foundCalmWords.length * 0.1;
			score -= foundAggressiveWords.length * 0.15;
			score = Math.max(0, Math.min(1, score));

			return {
				calm_words: foundCalmWords,
				aggressive_words: foundAggressiveWords,
				score
			};
		}
	} catch (error) {
		console.error('Error analyzing response:', error);
		return {
			calm_words: [],
			aggressive_words: [],
			score: 0.5
		};
	}
};

// ============================================================================
// USER PROFILE UPDATES
// ============================================================================

export const updateUserCalmScore = async (userId: string): Promise<boolean> => {
	// Get all completed sessions
	const { data: sessions, error: sessionsError } = await supabase
		.from('deescalation_sessions')
		.select('initial_calm_score, final_calm_score')
		.eq('user_id', userId)
		.eq('completed', true);

	if (sessionsError || !sessions) {
		console.error('Error fetching sessions for calm score calculation:', sessionsError);
		return false;
	}

	if (sessions.length === 0) return true; // No sessions yet

	// Calculate average improvement
	const improvements = sessions.map(s => (s.final_calm_score || 0) - s.initial_calm_score);
	const avgImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;

	// New calm score is initial score + average improvement (capped at 1.0)
	const newCalmScore = Math.min(1.0, 0.5 + avgImprovement);

	const { error } = await supabase
		.from('profiles')
		.update({
			calm_score: newCalmScore,
			total_training_sessions: sessions.length,
		})
		.eq('id', userId);

	if (error) {
		console.error('Error updating user calm score:', error);
		return false;
	}

	return true;
};
