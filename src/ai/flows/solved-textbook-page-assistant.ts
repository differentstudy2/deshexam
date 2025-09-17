'use server';
/**
 * @fileOverview An AI agent that generates summaries, explanations, and solved answers for textbook pages.
 *
 * - solvedTextbookPageAssistant - A function that handles the process of generating content for textbook pages.
 * - SolvedTextbookPageAssistantInput - The input type for the solvedTextbookPageAssistant function.
 * - SolvedTextbookPageAssistantOutput - The return type for the solvedTextbookPageAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const SolvedTextbookPageAssistantInputSchema = z.object({
  pageDataUri: z
    .string()
    .describe(
      "A textbook page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SolvedTextbookPageAssistantInput = z.infer<typeof SolvedTextbookPageAssistantInputSchema>;

const SolvedTextbookPageAssistantOutputSchema = z.object({
  summary: z.string().describe('A summary of the textbook page.'),
  explanations: z.string().describe('Explanations of the concepts on the page.'),
  solvedAnswers: z.string().describe('Solved answers to problems on the page.'),
});
export type SolvedTextbookPageAssistantOutput = z.infer<typeof SolvedTextbookPageAssistantOutputSchema>;

export async function solvedTextbookPageAssistant(input: SolvedTextbookPageAssistantInput): Promise<SolvedTextbookPageAssistantOutput> {
  return solvedTextbookPageAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solvedTextbookPageAssistantPrompt',
  input: {schema: SolvedTextbookPageAssistantInputSchema},
  output: {schema: SolvedTextbookPageAssistantOutputSchema},
  prompt: `You are an expert tutor, skilled at explaining concepts and solving problems from textbook pages.

You will generate a summary, explanations, and solved answers for the given textbook page.

Textbook Page: {{media url=pageDataUri}}

Summary:
Explanations:
Solved Answers:`,
});

const solvedTextbookPageAssistantFlow = ai.defineFlow(
  {
    name: 'solvedTextbookPageAssistantFlow',
    inputSchema: SolvedTextbookPageAssistantInputSchema,
    outputSchema: SolvedTextbookPageAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
