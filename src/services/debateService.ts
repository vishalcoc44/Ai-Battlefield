import { supabase } from '../lib/supabase';
import { getGeminiModel } from './gemini';

export interface Debate {
	id: string;
	user_id: string;
	persona_id: string;
	topic: string;
	steel_man_level: number;
	status: 'active' | 'ended' | 'paused';
	created_at: string;
	ended_at?: string;
}

export interface DebateMessage {
	id: string;
	debate_id: string;
	sender_type: 'user' | 'ai';
	content: string;
	fact_check_result?: {
		verified: boolean;
		sources: Array<{
			url: string;
			title: string;
			snippet: string;
		}>;
	};
	created_at: string;
}

// ============================================================================
// DEBATE OPERATIONS
// ============================================================================

export const createDebate = async (
	userId: string,
	personaId: string,
	topic: string
): Promise<Debate | null> => {
	const { data, error } = await supabase
		.from('debates')
		.insert({
			user_id: userId,
			persona_id: personaId,
			topic,
		})
		.select()
		.single();

	if (error) {
		console.error('Error creating debate:', error);
		return null;
	}

	return data;
};

export const getDebate = async (debateId: string): Promise<Debate | null> => {
	const { data, error } = await supabase
		.from('debates')
		.select('*')
		.eq('id', debateId)
		.single();

	if (error) {
		console.error('Error fetching debate:', error);
		return null;
	}

	return data;
};

export const updateDebateSteelManLevel = async (
	debateId: string,
	steelManLevel: number
): Promise<boolean> => {
	const { error } = await supabase
		.from('debates')
		.update({ steel_man_level: steelManLevel })
		.eq('id', debateId);

	if (error) {
		console.error('Error updating steel man level:', error);
		return false;
	}

	return true;
};

export const endDebate = async (debateId: string): Promise<boolean> => {
	const { error } = await supabase
		.from('debates')
		.update({
			status: 'ended',
			ended_at: new Date().toISOString()
		})
		.eq('id', debateId);

	if (error) {
		console.error('Error ending debate:', error);
		return false;
	}

	return true;
};

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

export const getDebateMessages = async (debateId: string): Promise<DebateMessage[]> => {
	const { data, error } = await supabase
		.from('debate_messages')
		.select('*')
		.eq('debate_id', debateId)
		.order('created_at', { ascending: true });

	if (error) {
		console.error('Error fetching debate messages:', error);
		return [];
	}

	return data || [];
};

export const saveDebateMessage = async (
	debateId: string,
	senderType: 'user' | 'ai',
	content: string,
	factCheckResult?: any
): Promise<DebateMessage | null> => {
	const { data, error } = await supabase
		.from('debate_messages')
		.insert({
			debate_id: debateId,
			sender_type: senderType,
			content,
			fact_check_result: factCheckResult,
		})
		.select()
		.single();

	if (error) {
		console.error('Error saving debate message:', error);
		return null;
	}

	return data;
};

// ============================================================================
// AI INTEGRATION
// ============================================================================

export const generateAIDebateResponse = async (
	userMessage: string,
	debateTopic: string,
	steelManLevel: number,
	personaPersonality: string
): Promise<string> => {
	try {
		const model = getGeminiModel();

		const steelManInstruction = steelManLevel > 0.7
			? "Respond as a strong steel-manned version of this persona - acknowledge the user's strongest arguments and build upon them constructively."
			: steelManLevel < 0.3
			? "Respond as a straw-man version of this persona - use weaker arguments and logical fallacies."
			: "Respond authentically as this persona with balanced arguments.";

		const prompt = `
You are debating as: ${personaPersonality}

Topic: ${debateTopic}

${steelManInstruction}

User's argument: "${userMessage}"

Respond with a thoughtful debate response. Keep it concise but substantive (2-3 paragraphs max).
Make it conversational and engaging.`;

		const result = await model.generateContent(prompt);
		const response = result.response;
		const text = response.text();

		return text.trim();
	} catch (error) {
		console.error('Error generating AI response:', error);
		return "I'm sorry, I encountered an error generating a response. Let's continue the debate!";
	}
};

export const factCheckClaim = async (claim: string): Promise<any> => {
	try {
		// This is a simplified fact-check. In a real implementation,
		// you'd integrate with fact-checking APIs like Google Fact Check Tools
		const model = getGeminiModel();

		const prompt = `
Fact-check this claim: "${claim}"

Provide a JSON response with:
{
  "verified": boolean,
  "confidence": number (0-1),
  "explanation": "brief explanation",
  "sources": [{"title": "source title", "url": "source url", "snippet": "brief quote"}]
}

Be maximally truth-seeking. If the claim is unverifiable, set verified to false.`;

		const result = await model.generateContent(prompt);
		const response = result.response;
		const text = response.text();

		try {
			return JSON.parse(text);
		} catch {
			// Fallback if JSON parsing fails
			return {
				verified: false,
				confidence: 0.5,
				explanation: "Unable to verify this claim automatically.",
				sources: []
			};
		}
	} catch (error) {
		console.error('Error fact-checking:', error);
		return {
			verified: false,
			confidence: 0,
			explanation: "Fact-checking service unavailable.",
			sources: []
		};
	}
};
