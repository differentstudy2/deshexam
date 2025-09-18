
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

const AILearnContentGeneratorInputSchema = z.object({
  topic: z.string().describe('The topic for the article.'),
});
export type AILearnContentGeneratorInput = z.infer<typeof AILearnContentGeneratorInputSchema>;

const AILearnContentGeneratorOutputSchema = z.object({
  title: z.string().describe('A suitable title for the generated article.'),
  description: z.string().describe('A brief, engaging summary of the article.'),
  body: z.string().describe('The full content of the article, written as a well-structured HTML string.'),
});
export type AILearnContentGeneratorOutput = z.infer<typeof AILearnContentGeneratorOutputSchema>;

export async function generateLearnContent(input: AILearnContentGeneratorInput): Promise<AILearnContentGeneratorOutput> {
  return generateLearnContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiLearnContentGeneratorPrompt',
  input: { schema: AILearnContentGeneratorInputSchema },
  output: { schema: AILearnContentGeneratorOutputSchema },
  prompt: `You are an expert content writer specializing in creating stylish and engaging educational articles.
Your task is to write a comprehensive article on the following topic: "{{topic}}".

The article must be well-structured, visually appealing, and easy for students to read and understand.
Please generate the following:
1.  A compelling and SEO-friendly title for the article.
2.  A short, one-paragraph description or summary to be used as a meta description.
3.  The full body of the article as a well-formed HTML string. Do not include <html> or <body> tags.

For the HTML body, you must use a variety of tags to make the post stylish and organized. Specifically include:
- A main heading using <h1>.
- Multiple sub-sections using <h2>, <h3>, and <h4> tags to create a clear hierarchy.
- Paragraphs using <p> tags for the main text.
- Unordered lists (<ul> with <li>) for bullet points to break down information.
- A data table (<table> with <thead>, <tbody>, <tr>, <th>, and <td>) to present structured information where appropriate (e.g., for comparisons, definitions, or key data).
- Use text formatting tags like <strong> for emphasis, <em> for italics, and <blockquote> for quoting key concepts or definitions.

Ensure the content is accurate, informative, and exceptionally well-written. The structure should be logical, flowing from an introduction to detailed sections and a concluding summary.
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
