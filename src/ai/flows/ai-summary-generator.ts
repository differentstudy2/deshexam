
'use server';
/**
 * @fileOverview Generates a summary for a given text content.
 *
 * - generateSummary - A function that generates a summary.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AISummaryGeneratorInputSchema = z.object({
  content: z.string().describe('The text content to be summarized.'),
});
export type AISummaryGeneratorInput = z.infer<typeof AISummaryGeneratorInputSchema>;

const AISummaryGeneratorOutputSchema = z.object({
  summary: z.string().describe('The generated summary in Markdown format.'),
  keyPoints: z.array(z.string()).describe('A list of key points from the content.'),
});
export type AISummaryGeneratorOutput = z.infer<typeof AISummaryGeneratorOutputSchema>;

export async function generateSummary(input: AISummaryGeneratorInput): Promise<AISummaryGeneratorOutput> {
  return generateSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSummaryGeneratorPrompt',
  input: { schema: AISummaryGeneratorInputSchema },
  output: { schema: AISummaryGeneratorOutputSchema },
  prompt: `You are an expert at simplifying complex educational content. Your task is to analyze the following text and generate a clear, easy-to-understand summary and a list of key takeaways.

IMPORTANT: You MUST generate all content (summary, key points) in the same language as the provided source material.

Source Content:
---
{{content}}
---

**Instructions:**
1.  **Summary:** Write a concise summary of the content. Explain the main concepts in a simple and straightforward way, as if you were explaining it to a beginner. The summary should be in well-formatted Markdown.
2.  **Key Points:** Identify and list the most important points or facts from the text. This should be a bulleted list.

Ensure the output is accurate and captures the essence of the original text.
`,
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: AISummaryGeneratorInputSchema,
    outputSchema: AISummaryGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
