// This is a server-side file.
'use server';

/**
 * @fileOverview Ranks content (reviews, comments) based on likes/dislikes.
 *
 * - aiContentRanker: Ranks content based on likes/dislikes.
 * - AIContentRankerInput: Input type for the aiContentRanker function.
 * - AIContentRankerOutput: Return type for the aiContentRanker function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIContentRankerInputSchema = z.object({
  content: z.string().describe('The content to be ranked (e.g., review or comment text).'),
  likes: z.number().describe('The number of likes the content has received.'),
  dislikes: z.number().describe('The number of dislikes the content has received.'),
});
export type AIContentRankerInput = z.infer<typeof AIContentRankerInputSchema>;

const AIContentRankerOutputSchema = z.object({
  rank: z.number().describe('A numerical rank indicating the usefulness of the content. Higher values indicate more useful content.'),
  reason: z.string().describe('Explanation of why the content was ranked in the way it was.'),
});
export type AIContentRankerOutput = z.infer<typeof AIContentRankerOutputSchema>;

export async function aiContentRanker(input: AIContentRankerInput): Promise<AIContentRankerOutput> {
  return aiContentRankerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiContentRankerPrompt',
  input: {schema: AIContentRankerInputSchema},
  output: {schema: AIContentRankerOutputSchema},
  prompt: `You are an AI content ranker that determines the usefulness of user-generated content based on its likes and dislikes.

  Content: {{{content}}}
  Likes: {{{likes}}}
  Dislikes: {{{dislikes}}}

  Calculate a rank between 0 and 10 (inclusive), where 0 is the least useful and 10 is the most useful.
  Provide a brief explanation for the ranking.
  Consider the ratio of likes to dislikes, and the absolute number of likes and dislikes.
`,
});

const aiContentRankerFlow = ai.defineFlow(
  {
    name: 'aiContentRankerFlow',
    inputSchema: AIContentRankerInputSchema,
    outputSchema: AIContentRankerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
