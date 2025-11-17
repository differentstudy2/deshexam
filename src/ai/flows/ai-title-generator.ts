
'use server';
/**
 * @fileOverview Generates a title for educational content using an AI model.
 *
 * - generateTitle - A function that generates a title based on a URL or topic.
 * - AITitleGeneratorInput - The input type for the generateTitle function.
 * - AITitleGeneratorOutput - The return type for the generateTitle function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AITitleGeneratorInputSchema = z.object({
  source: z.string().describe('The URL or topic for which to generate a title.'),
});
export type AITitleGeneratorInput = z.infer<typeof AITitleGeneratorInputSchema>;

const AITitleGeneratorOutputSchema = z.object({
  title: z.string().describe('A compelling and SEO-friendly title for the content.'),
});
export type AITitleGeneratorOutput = z.infer<typeof AITitleGeneratorOutputSchema>;

export async function generateTitle(input: AITitleGeneratorInput): Promise<AITitleGeneratorOutput> {
  return generateTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTitleGeneratorPrompt',
  input: { schema: AITitleGeneratorInputSchema },
  output: { schema: AITitleGeneratorOutputSchema },
  prompt: `You are an expert at writing compelling and SEO-friendly titles for online content. 
Your task is to generate a brief, engaging title based on the provided URL or topic: "{{source}}".

The title should be concise, informative, and optimized for search engines.
`,
});

const generateTitleFlow = ai.defineFlow(
  {
    name: 'generateTitleFlow',
    inputSchema: AITitleGeneratorInputSchema,
    outputSchema: AITitleGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
