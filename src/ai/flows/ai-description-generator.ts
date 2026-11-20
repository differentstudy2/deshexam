
'use server';
/**
 * @fileOverview Generates a description for educational content using an AI model.
 *
 * - generateDescription - A function that generates a description based on a title or topic.
 * - AIDescriptionGeneratorInput - The input type for the generateDescription function.
 * - AIDescriptionGeneratorOutput - The return type for the generateDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIDescriptionGeneratorInputSchema = z.object({
  source: z.string().describe('The title or topic for which to generate a description.'),
});
export type AIDescriptionGeneratorInput = z.infer<typeof AIDescriptionGeneratorInputSchema>;

const AIDescriptionGeneratorOutputSchema = z.object({
  description: z.string().describe('A brief and engaging description for the content.'),
});
export type AIDescriptionGeneratorOutput = z.infer<typeof AIDescriptionGeneratorOutputSchema>;

export async function generateDescription(input: AIDescriptionGeneratorInput): Promise<AIDescriptionGeneratorOutput> {
  return generateDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDescriptionGeneratorPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: AIDescriptionGeneratorInputSchema },
  output: { schema: AIDescriptionGeneratorOutputSchema },
  prompt: `You are an expert at writing compelling and concise summaries for educational content. 
Your task is to generate a brief, one-paragraph description based on the provided title or topic: "{{source}}".

The description should be engaging and accurately reflect the potential content, suitable for use as a meta description or summary.
`,
});

const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: AIDescriptionGeneratorInputSchema,
    outputSchema: AIDescriptionGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
