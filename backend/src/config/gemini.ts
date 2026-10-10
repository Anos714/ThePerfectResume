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

// Google's hosted models routinely return 503 "high demand" for a single
// model while its siblings serve fine. Chaining the configured model with a
// few known-good fallbacks keeps every AI feature working through those
// spikes instead of failing for the whole app.
const DEFAULT_FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.7-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
] as const;

/**
 * The ordered list of models to try, deduplicated: the configured primary
 * first, then `GEMINI_FALLBACK_MODELS`, then the built-in defaults. A model
 * that is unavailable (404) or overloaded (503) simply advances to the next.
 */
export const geminiModelChain = (): string[] => {
  const configured = env.GEMINI_FALLBACK_MODELS.split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  return [
    ...new Set<string>([
      env.GEMINI_MODEL,
      ...configured,
      ...DEFAULT_FALLBACK_MODELS,
    ]),
  ];
};
