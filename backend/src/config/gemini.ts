import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";

export const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const getGeminiModel = (modelName?: string) =>
  genAI.getGenerativeModel({
    model: modelName ?? env.GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });
