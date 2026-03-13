
'use server';
/**
 * @fileOverview Generates educational questions using an AI model.
 *
 * - generateQuestions - A function that generates questions based on user prompts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const QuestionSchema = z.object({
  text: z.string().describe('The text of the question.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching', 'Descriptive']).describe('The type of the question.'),
  marks: z.coerce.number().int().min(1, 'Marks must be a positive number.').describe('The marks allocated for the question.'),
  options: z.array(z.object({ text: z.string() })).optional().describe('An array of options for Multiple Choice or True/False questions.'),
  matchingOptions: z.object({
      columnA: z.array(z.object({ text: z.string(), image: z.string().optional() })).describe("An array of items for Column A."),
      columnB: z.array(z.object({ text: z.string(), image: z.string().optional() })).describe("An array of items for Column B."),
  }).optional().describe('The columns for a Matching question. Both columns must have the same number of items.'),
  correctAnswer: z.any().describe('The correct answer for the question. For Multiple Choice, it is a string. For Matching, it is an array of objects like `[{ a: "itemA", aImage: "url", b: "itemB", bImage: "url" }]` where `itemA` is from Column A and `itemB` is from Column B, representing the correct pairs. For Descriptive questions, this should be a model answer. Image URLs are optional.'),
  explanation: z.string().optional().describe('A general explanation for the correct answer.'),
});

const AIQuestionGeneratorInputSchema = z.object({
  numQuestions: z.coerce.number().int().min(1).describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the questions.'),
  sourceType: z.enum(['topic', 'text', 'chapterContent', 'file']).describe('The source of the content to be generated.'),
  source: z.string().describe('The source topic, text content, or data URI for a file.'),
  questionType: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching', 'Descriptive', 'Any']).optional().describe('The specific type of question to generate.'),
});
export type AIQuestionGeneratorInput = z.infer<typeof AIQuestionGeneratorInputSchema>;


const AIQuestionGeneratorOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('An array of generated questions.'),
});
export type AIQuestionGeneratorOutput = z.infer<typeof AIQuestionGeneratorOutputSchema>;

export async function generateQuestions(input: AIQuestionGeneratorInput): Promise<AIQuestionGeneratorOutput> {
  return generateQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiQuestionGeneratorPrompt',
  input: { schema: AIQuestionGeneratorInputSchema },
  output: { schema: AIQuestionGeneratorOutputSchema },
  prompt: `You are an expert at creating educational questions. Your task is to generate a set of questions based on the provided source.

**Formatting Rules**:
1.  **Markdown First**: Primarily use GitHub-flavored Markdown for all text formatting (headings, lists, bold, italics). Use simple, clear Markdown. For example, to bold a word, use **word**, not complex cases like **'word'**. Avoid putting emphasis markers like \`**\` or \`*\` right next to punctuation.
2.  **LaTeX for Math**: For any mathematical expressions, formulas, or chemical equations, you MUST enclose them in LaTeX delimiters. Use a single dollar sign for inline math (e.g., $E=mc^2$) and double dollar signs for block-level math (e.g., $$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$). For mathematical grouping, use parentheses () or square brackets [] inside the math delimiters, not curly braces {}, unless it is part of a specific LaTeX command like \\frac{a}{b}. Pay close attention to chemical formulas and reactions, using correct LaTeX syntax for subscripts (e.g., $H_2O$), reaction arrows (e.g., $\\rightarrow$), and symbols (e.g., \`\\therefore\` for ∴).
3.  **Language**: You MUST generate all content (questions, options, explanations) in the same language as the provided source material.

The questions should have the following properties:
- Number of questions: {{numQuestions}}
- Difficulty level: {{difficulty}}
{{#if questionType}}
- Question Type: {{questionType}}
{{/if}}

{{#if isTopic}}
The topic for the questions is "{{source}}".
{{else if isUri}}
The source for the questions is the following document/image. Extract the content and generate questions from it:
{{media url=source}}
{{else}}
The source text for the questions is:
---
{{source}}
---
{{/if}}


Please generate only the specified number of questions based on the source. Do not generate a title or description.
For each question, provide:
- The question text. For "Fill in the Blank" questions, use "____" to indicate the blank. For "Matching" questions, use a clear instruction like "Match the items from Column A to Column B." For "Descriptive" questions, the question should be open-ended.
- The question type. If a specific Question Type is provided above (and is not 'Any'), all questions MUST be of that type. Otherwise, you can mix the types.
- The marks for the question (default to 1).
- For 'Multiple Choice' questions, provide exactly 4 options. For each option, provide only the option text.
- For 'True/False' questions, you MUST provide an options array with two items: one for 'True' and one for 'False'.
- For 'Matching' questions, you MUST provide the 'correctAnswer' as an array of objects. Each object represents a correct pair and MUST contain a text 'a' and a text 'b', like \`[{ a: 'Item from Column A', b: 'Corresponding item from Column B' }]\`. You can optionally include an 'aImage' and 'bImage' field with a valid image URL if relevant (e.g., from an encyclopedia or public domain source). The 'matchingOptions' field will be constructed from this and should not be generated by you.
- For 'Descriptive' questions, the 'correctAnswer' should be a model answer or a list of key points to be included in a good answer.
- The correct answer. For 'Multiple Choice' questions, this value MUST be an exact, case-sensitive match to the text of one of the provided options. For 'True/False', it must be either 'True' or 'False'.
- A general explanation for the correct answer that summarizes the main concept. For "Multiple Choice" and "True/False" questions, this explanation is mandatory and MUST be provided. For Fill in the Blank, explain the concept behind the answer. For Matching, provide a summary of the relationships.

Ensure the generated questions are accurate and relevant to the provided source.
The questions should be diverse and test different aspects of the topic.
`,
});

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: AIQuestionGeneratorInputSchema,
    outputSchema: AIQuestionGeneratorOutputSchema,
  },
  async (input) => {
    const isTopic = input.sourceType === 'topic';
    const isUri = input.sourceType === 'file' && input.source.startsWith('data:');
    const { output } = await prompt({ ...input, isTopic, isUri });

    if (output && output.questions) {
      output.questions = output.questions.map(q => {
        if (q.type === 'Matching' && q.correctAnswer && Array.isArray(q.correctAnswer)) {
            const pairs = q.correctAnswer as { a: string, aImage?: string, b: string, bImage?: string }[];
            const columnA = pairs.map(p => ({ text: p.a, image: p.aImage }));
            let columnB = pairs.map(p => ({ text: p.b, image: p.bImage }));
            
            // Shuffle column B
            for (let i = columnB.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [columnB[i], columnB[j]] = [columnB[j], columnB[i]];
            }
            q.matchingOptions = { columnA, columnB };
        }
        return q;
      });
    }
    
    return output!;
  }
);

    