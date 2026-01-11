
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
  content: z.string().describe('The transcribed and styled content from the textbook page in Markdown format.'),
});
export type SolvedTextbookPageAssistantOutput = z.infer<typeof SolvedTextbookPageAssistantOutputSchema>;

export async function solvedTextbookPageAssistant(input: SolvedTextbookPageAssistantInput): Promise<SolvedTextbookPageAssistantOutput> {
  return solvedTextbookPageAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solvedTextbookPageAssistantPrompt',
  input: {schema: SolvedTextbookPageAssistantInputSchema},
  output: {schema: SolvedTextbookPageAssistantOutputSchema},
  prompt: `You are an expert at extracting and styling text content from images of textbook pages. Your task is to transcribe the text and then format it into clear, stylish, and engaging Markdown.

**Instructions:**
1.  **Transcribe:** First, accurately read all the text from the provided textbook page image. Pay close attention to headings, subheadings, lists, paragraphs, and any special text.
2.  **Format:** Convert the transcribed text into well-structured GitHub-flavored Markdown.
3.  **Stylize:** Enhance the Markdown with the following elements to make it visually appealing:
    *   **VERY IMPORTANT**: For any mathematical expressions, formulas, or equations, you MUST enclose them in LaTeX delimiters. Use a single dollar sign for inline math (e.g., $E=mc^2$) and double dollar signs for block-level math (e.g., $$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$). This is crucial for correct rendering.
    *   **Headings:** Use \`#\`, \`##\`, \`###\` for titles and sections.
    *   **Emphasis:** Use **bold** and *italics* to highlight key terms and concepts.
    *   **Lists:** Use bulleted (\`*\`) or numbered (\`1.\`) lists for items or steps.
    *   **Emojis:** Sparingly use relevant emojis to add visual cues and make the content more engaging (e.g., 💡 for a key idea, 🧪 for a science concept, 📌 for a definition).
    *   **Blockquotes:** Use \`>\` for important definitions or quotes.

**Input:**
Textbook Page: {{media url=pageDataUri}}

**Output Requirement:**
Return a single Markdown string containing the styled content. Ensure the output preserves the original language and meaning of the source text.
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
