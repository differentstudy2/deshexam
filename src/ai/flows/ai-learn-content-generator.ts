
'use server';
/**
 * @fileOverview Generates educational articles (Learn content) using an AI model.
 *
 * - generateLearnContent - A function that generates an article based on a topic.
 * - AILearnContentGeneratorInput - The input type for the function.
 * - AILearnContentGeneratorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const AILearnContentGeneratorInputSchema = z.object({
  topic: z.string().describe('The topic for the article.'),
});
export type AILearnContentGeneratorInput = z.infer<typeof AILearnContentGeneratorInputSchema>;

export const AILearnContentGeneratorOutputSchema = z.object({
  title: z.string().describe('A suitable title for the generated article.'),
  description: z.string().describe('A brief, engaging summary of the article.'),
  body: z.string().describe('The full content of the article, written in Markdown format.'),
});
export type AILearnContentGeneratorOutput = z.infer<typeof AILearnContentGeneratorOutputSchema>;

export async function generateLearnContent(input: AILearnContentGeneratorInput): Promise<AILearnContentGeneratorOutput> {
  return generateLearnContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiLearnContentGeneratorPrompt',
  input: { schema: AILearnContentGeneratorInputSchema },
  output: { schema: AILearnContentGeneratorOutputSchema },
  prompt: `You are an expert content writer specializing in educational articles.
Your task is to write a comprehensive and engaging article on the following topic: "{{topic}}".

The article should be well-structured, easy to understand, and suitable for students.
Please generate the following:
1.  A compelling and SEO-friendly title for the article.
2.  A short, one-paragraph description or summary to be used as a meta description.
3.  The full body of the article in Markdown format. Use headings, lists, bold text, and other Markdown features to make the content readable and organized.

Ensure the content is accurate, informative, and well-written.
`,
});

const generateLearnContentFlow = ai.defineFlow(
  {
    name: 'generateLearnContentFlow',
    inputSchema: AILearnContentGeneratorInputSchema,
    outputSchema: AILearnContentGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
