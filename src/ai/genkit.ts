
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview Centralized Genkit configuration for Ezzy Bites.
 * Standardizes the AI logic node using the Gemini 1.5 Flash model.
 */

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ [Ezzy AI] GEMINI_API_KEY is missing. Generative features will be unavailable.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  // Use the stable model identifier for Gemini 1.5 Flash
  model: 'googleai/gemini-1.5-flash',
});
