
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ [Ezzy AI] GEMINI_API_KEY is missing. AI features will be unavailable.');
} else if (!apiKey.startsWith('AIza') && !apiKey.startsWith('AQ.')) {
  console.warn('⚠️ [Ezzy AI] GEMINI_API_KEY does not appear to be a valid credential.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  // Use the stable model identifier recognized by the Genkit plugin
  model: 'googleai/gemini-1.5-flash',
});
