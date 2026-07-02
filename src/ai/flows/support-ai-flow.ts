
'use server';
/**
 * @fileOverview High-Integrity Order Support AI for Ezzy Bites.
 * Synchronized with live Firestore order nodes and operational policy.
 * Resolves logic failures with resilient error recovery.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SupportAIInputSchema = z.object({
  message: z.string().describe('The user\'s current question or concern.'),
  category: z.string().optional().describe('The selected support category.'),
  orderContext: z.string().optional().describe('JSON string of the current selected order data.'),
  menuContext: z.string().optional().describe('Real-time menu data.'),
  settingsContext: z.string().optional().describe('Real-time store settings.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional()
});

export type SupportAIInput = z.infer<typeof SupportAIInputSchema>;

const SupportAIOutputSchema = z.object({
  reply: z.string().describe('The AI response message.'),
  suggestedActions: z.array(z.string()).optional().describe('Quick reply buttons.'),
  protocolAction: z.enum(['TRACK_ORDER', 'CANCEL_ORDER', 'CHANGE_ADDRESS', 'CALL_RESTAURANT', 'MISSING_ITEM_FLOW', 'NONE']).default('NONE').describe('Internal protocol to trigger UI components.')
});

export type SupportAIOutput = z.infer<typeof SupportAIOutputSchema>;

export async function ezzySupportAI(input: SupportAIInput): Promise<SupportAIOutput> {
  return supportAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ezzySupportPrompt',
  input: { schema: SupportAIInputSchema },
  output: { schema: SupportAIOutputSchema },
  prompt: `You are "Ezzy AI", the logistics and flavor assistant for "Ezzy Bites".
You MUST provide answers based ONLY on the REAL-TIME REGISTRY DATA provided. 

--- OPERATIONAL GUIDELINES ---
1. WHERE IS MY ORDER: 
   - Status 'pending': ~30 mins.
   - Status 'accepted': ~25 mins.
   - Status 'preparing': ~15 mins.
   - Status 'out_for_delivery': ~5-8 mins.
   - Trigger protocolAction: 'TRACK_ORDER'.

2. CANCELLATION:
   - Allowed ONLY if order was placed within the last 5 minutes.
   - If allowed, trigger protocolAction: 'CANCEL_ORDER'.
   - If not, explain that the kitchen station has already committed resources.

3. CHANGE ADDRESS:
   - Allowed ONLY if status is 'pending'.
   - If allowed, trigger protocolAction: 'CHANGE_ADDRESS'.
   - If status is 'accepted' or beyond, inform them logistics are locked.

4. MISSING/WRONG ITEM:
   - Apologize sincerely.
   - Trigger protocolAction: 'MISSING_ITEM_FLOW' if they ask about missing items.
   - Trigger protocolAction: 'CALL_RESTAURANT' for wrong items.

5. DELIVERED BUT NOT RECEIVED:
   - If status is 'delivered', inform them and trigger 'CALL_RESTAURANT'.

--- REGISTRY DATA ---
{{#if orderContext}}CURRENT ORDER SIGNAL:
{{{orderContext}}}{{/if}}

{{#if settingsContext}}STORE SETTINGS:
{{{settingsContext}}}{{/if}}

USER MESSAGE:
{{{message}}}

Provide a professional, concise response in the defined JSON format.`
});

const supportAIFlow = ai.defineFlow(
  {
    name: 'supportAIFlow',
    inputSchema: SupportAIInputSchema,
    outputSchema: SupportAIOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error('AI Hub failed to yield logic.');
      return output;
    } catch (error) {
      console.error('🔥 [Ezzy AI] Logic Error:', error);
      return { 
        reply: "I'm having trouble syncing with our logistics hub. Please call our station directly for immediate assistance.",
        protocolAction: 'CALL_RESTAURANT',
        suggestedActions: ["Call Station", "View Menu"]
      };
    }
  }
);
