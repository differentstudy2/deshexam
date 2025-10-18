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
  content: z.string().describe('The transcribed content from the textbook page.'),
});
export type SolvedTextbookPageAssistantOutput = z.infer<typeof SolvedTextbookPageAssistantOutputSchema>;

export async function solvedTextbookPageAssistant(input: SolvedTextbookPageAssistantInput): Promise<SolvedTextbookPageAssistantOutput> {
  return solvedTextbookPageAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solvedTextbookPageAssistantPrompt',
  input: {schema: SolvedTextbookPageAssistantInputSchema},
  output: {schema: SolvedTextbookPageAssistantOutputSchema},
  prompt: `You are an expert at extracting text content from images.

You will transcribe the text from the given textbook page exactly as it appears, preserving the original language and formatting as much as possible.

Textbook Page: {{media url=pageDataUri}}

`,
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
