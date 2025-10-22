'use server';
/**
 * @fileOverview Generates educational questions specifically for textbook content.
 *
 * - generateTextbookQuestions - A function that generates questions from a given text passage.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const QuestionSchema = z.object({
  text: z.string().describe('The text of the question.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching', 'Grouped']),
  marks: z.coerce.number().int().min(1, 'Marks must be a positive number.').default(1),
  options: z.array(z.object({ text: z.string(), explanation: z.string().optional() })).optional(),
  correctAnswer: z.any().optional(),
  explanation: z.string().optional(),
  subQuestions: z.array(z.object({
    id: z.string().optional(),
    text: z.string().optional(),
    type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching']),
    marks: z.coerce.number().optional(),
    options: z.array(z.object({ text: z.string(), explanation: z.string().optional() })).optional(),
    correctAnswer: z.any().optional(),
    explanation: z.string().optional(),
  })).optional(),
});


const AITextbookQuestionGeneratorInputSchema = z.object({
  numQuestions: z.coerce.number().int().min(1).describe('The number of questions to generate.'),
  sourceText: z.string().describe('The source textbook chapter content.'),
  questionTypes: z.array(z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching', 'Grouped'])).min(1),
});
export type AITextbookQuestionGeneratorInput = z.infer<typeof AITextbookQuestionGeneratorInputSchema>;


const AITextbookQuestionGeneratorOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('An array of generated questions.'),
});
export type AITextbookQuestionGeneratorOutput = z.infer<typeof AITextbookQuestionGeneratorOutputSchema>;

export async function generateTextbookQuestions(input: AITextbookQuestionGeneratorInput): Promise<AITextbookQuestionGeneratorOutput> {
  return generateTextbookQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTextbookQuestionGeneratorPrompt',
  input: { schema: AITextbookQuestionGeneratorInputSchema },
  output: { schema: AITextbookQuestionGeneratorOutputSchema },
  prompt: `You are an expert at creating educational questions from a given text. Your task is to generate a set of questions based on the provided textbook content.

The questions should have the following properties:
- Number of questions: {{numQuestions}}
- Question Types: {{#each questionTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

The source text is:
---
{{sourceText}}
---

Please generate only the specified number of questions based on the source. Do not generate a title or description. Ensure the questions test understanding of the provided text.

For each question, provide:
- The question text. For "Fill in the Blank" questions, use "____" to indicate the blank. For "Grouped" questions, provide the main passage or instruction.
- The question type. You can mix the types from the list provided.
- The marks for the question (default to 1).
- For 'Multiple Choice' questions, provide exactly 4 options with explanations for each.
- The correct answer.
- A general explanation for the correct answer.
- For 'Grouped' questions, provide an array of 'subQuestions' with their own properties.
`,
});

const generateTextbookQuestionsFlow = ai.defineFlow(
  {
    name: 'generateTextbookQuestionsFlow',
    inputSchema: AITextbookQuestionGeneratorInputSchema,
    outputSchema: AITextbookQuestionGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
