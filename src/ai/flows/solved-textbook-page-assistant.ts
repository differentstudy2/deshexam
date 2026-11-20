
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
  model: 'googleai/gemini-2.5-flash',
  input: {schema: SolvedTextbookPageAssistantInputSchema},
  output: {schema: SolvedTextbookPageAssistantOutputSchema},
  prompt: `You are an expert at extracting and styling text content from images of textbook pages. Your task is to transcribe the text and then format it into clear, stylish, and engaging Markdown.

**Formatting Rules**:
1.  **Transcribe and Format**: First, accurately read all the text from the provided textbook page image. Pay close attention to headings, subheadings, lists (especially lettered lists like \`(a)\`, \`(b)\`), paragraphs, tables, and any special text. Then, convert the transcribed text into well-structured GitHub-flavored Markdown. The structure of your output, including text, tables, math, and placement of images, should closely match the provided textbook page image, including line breaks.
2.  **Markdown First**: Primarily use GitHub-flavored Markdown for all text formatting (headings, lists, bold, italics). Use simple, clear Markdown. For example, to bold a word, use **word**, not complex cases like **'word'**. Avoid putting emphasis markers like \`**\` or \`*\` right next to punctuation. Pay close attention to lettered lists like (a), (b), (c) and preserve their structure.
3.  **LaTeX for Math**: For any mathematical expressions, formulas, or chemical equations, you MUST enclose them in LaTeX delimiters. Use a single dollar sign for inline math (e.g., $E=mc^2$) and double dollar signs for block-level math (e.g., $$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$). For mathematical grouping, use parentheses () or square brackets [] inside the math delimiters, not curly braces {}, unless it is part of a specific LaTeX command like \\frac{a}{b}. For symbols, use their LaTeX commands, for instance \`\\therefore\` for the 'therefore' symbol (∴). This is crucial for correct rendering.
4.  **Responsive HTML for Layout**: For complex layouts that Markdown cannot handle, you MAY use simple HTML. To float an image, wrap the image and the text in a '<div class="clearfix">', then apply 'float-left-responsive' or 'float-right-responsive' to the image element. To arrange images side-by-side, use a '<div class="image-grid">' and wrap each image/caption in a '<figure>' and '<figcaption>'. Do NOT use inline \`style\` attributes.
5.  **Images**: If the source image contains illustrations, represent them with a placeholder image using the format \`![Description](https://picsum.photos/seed/relevant-keyword/600/400)\` where 'relevant-keyword' describes the image content (e.g., 'thermometer', 'plant-cell'). The entire image tag MUST be on a single line.
6.  **Emphasis:** Use **bold** and *italics* to highlight key terms and concepts, just like in the source.
7.  **Emojis:** Sparingly use relevant emojis to add visual cues and make the content more engaging (e.g., 💡 for a key idea, 🧪 for a science concept, 📌 for a definition).
8.  **Blockquotes:** Use \`>\` for important definitions or quotes.

**Input:**
Textbook Page: {{media url=pageDataUri}}

**Output Requirement:**
Return a single Markdown string containing the styled content. The structure, including text, tables, math, and placement of images, should closely match the provided textbook page image. Ensure the output preserves the original language and meaning of the source text.
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
    if (!output?.content) {
      throw new Error('The AI failed to generate any content. Please try again.');
    }
    return output;
  }
);

    

    