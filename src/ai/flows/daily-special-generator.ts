'use server';
/**
 * @fileOverview A Genkit flow for generating marketing copy for a daily special food item.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DailySpecialInputSchema = z.object({
  dishName: z.string().describe('The name of the dish to promote.'),
  basePrice: z.number().describe('The normal price of the dish.'),
  discountPercent: z.number().describe('The discount percentage to apply.'),
});
export type DailySpecialInput = z.infer<typeof DailySpecialInputSchema>;

const DailySpecialOutputSchema = z.object({
  promoTitle: z.string().describe('A catchy title for the promotion.'),
  promoDescription: z.string().describe('Engaging description for social media.'),
  finalPrice: z.number().describe('Calculated price after discount.'),
  emoji: z.string().describe('A relevant emoji for the promotion.'),
});
export type DailySpecialOutput = z.infer<typeof DailySpecialOutputSchema>;

export async function dailySpecialGenerator(input: DailySpecialInput): Promise<DailySpecialOutput> {
  return dailySpecialGeneratorFlow(input);
}

const promoPrompt = ai.definePrompt({
  name: 'dailySpecialPrompt',
  input: { 
    schema: DailySpecialInputSchema.extend({
      calculatedFinalPrice: z.number().describe('The final price calculated after discount.')
    }) 
  },
  output: { schema: DailySpecialOutputSchema },
  prompt: `You are a creative marketing expert for "Savora".
Generate a promotion for: {{{dishName}}}.
The base price is ₹{{{basePrice}}} and we are offering a {{{discountPercent}}}% discount.
Final price: ₹{{{calculatedFinalPrice}}}.`,
});

const dailySpecialGeneratorFlow = ai.defineFlow(
  {
    name: 'dailySpecialGeneratorFlow',
    inputSchema: DailySpecialInputSchema,
    outputSchema: DailySpecialOutputSchema,
  },
  async (input) => {
    try {
      const finalPrice = Math.round(input.basePrice * (1 - (input.discountPercent / 100)));
      const { output } = await promoPrompt({
        ...input,
        calculatedFinalPrice: finalPrice
      });
      if (!output) throw new Error('Failed to generate promotion.');
      return output;
    } catch (error) {
      console.error('🔥 [Savora AI] Daily Special Flow Error:', error);
      throw error;
    }
  }
);
