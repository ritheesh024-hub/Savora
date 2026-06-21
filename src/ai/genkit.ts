import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview Centralized Genkit configuration for Ezzy Bites.
 * Standardizes the AI logic node using the stable Gemini 1.5 Flash model.
 */

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ [Ezzy AI] Warning: GEMINI_API_KEY is missing from environment variables.');
} else {
  console.log('✅ [Ezzy AI] Initializing Gemini logic node with production credentials.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  // Use the fully qualified stable model identifier to prevent 404 mapping errors
  model: 'googleai/gemini-1.5-flash',
});
