
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
  body: z.string().describe('The full content of the article, written in GitHub-flavored Markdown.'),
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

**Formatting Rules**:
1.  **Markdown First**: Primarily use GitHub-flavored Markdown for all text formatting (headings, lists, bold, italics). Use simple, clear Markdown. For example, to bold a word, use **word**, not complex cases like **'word'**. Avoid putting emphasis markers like \`**\` or \`*\` right next to punctuation.
2.  **LaTeX for Math**: For any mathematical expressions, formulas, or equations, you MUST enclose them in LaTeX delimiters. Use a single dollar sign for inline math (e.g., $E=mc^2$) and double dollar signs for block-level math (e.g., $$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$).
3.  **Responsive HTML for Layout**: For complex layouts that Markdown cannot handle, you MAY use simple HTML. To float an image, wrap the image and the text in a '<div class="clearfix">', then apply 'float-left-responsive' or 'float-right-responsive' to the image element. To arrange images side-by-side, use a '<div class="image-grid">' and wrap each image/caption in a '<figure>' and '<figcaption>'. Do NOT use inline \`style\` attributes.
4.  **Images**: If an image would be helpful, you MUST add a placeholder image URL. Use the format \`![Description](https://picsum.photos/seed/relevant-keyword/600/400)\` where 'relevant-keyword' is a specific, relevant term from the content.

The article must be well-structured, visually appealing, and easy for students to read and understand.
Please generate the following:
1.  A compelling and SEO-friendly title for the article.
2.  A short, one-paragraph description or summary to be used as a meta description.
3.  The full body of the article as a well-formed Markdown string, following the formatting rules above.

For the Markdown body, you must use a variety of elements to make the post stylish and organized. Specifically include:
- A main heading using a '#'.
- Multiple sub-sections using '##', '###', and '####' to create a clear hierarchy.
- Paragraphs for the main text.
- Unordered lists (using '*') for bullet points to break down information.
- A data table to present structured information where appropriate (e.g., for comparisons, definitions, or key data).
- Use text formatting like **bold** for emphasis, *italics*, and > for blockquotes for quoting key concepts or definitions.

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
