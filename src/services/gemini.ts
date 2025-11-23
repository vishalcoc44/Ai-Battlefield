import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = () => {
	return genAI.getGenerativeModel({ model: "gemini-pro" });
};
