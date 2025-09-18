
'use server';
/**
 * @fileOverview Generates educational content (quizzes, tests) using an AI model.
 *
 * - generateContent - A function that generates content based on user prompts.
 * - AIContentGeneratorInput - The input type for the generateContent function.
 * - AIContentGeneratorOutput - The return type for the generateContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
  text: z.string().describe('The text of the question.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer']).describe('The type of the question.'),
  marks: z.coerce.number().int().min(1, 'Marks must be a positive number.').describe('The marks allocated for the question.'),
  options: z.array(z.object({ text: z.string() })).optional().describe('An array of options for Multiple Choice questions.'),
  correctAnswer: z.string().describe('The correct answer for the question.'),
});

export type AIContentGeneratorInput = z.infer<typeof AIContentGeneratorInputSchema>;
const AIContentGeneratorInputSchema = z.object({
  topic: z.string().describe('The main topic or subject for the content to be generated.'),
  contentType: z.string().describe('The type of content to generate (e.g., "Mock Test", "Quiz").'),
  numQuestions: z.number().int().positive().describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the questions.'),
});

export type AIContentGeneratorOutput = z.infer<typeof AIContentGeneratorOutputSchema>;
const AIContentGeneratorOutputSchema = z.object({
  title: z.string().describe('A suitable title for the generated content.'),
  description: z.string().describe('A brief description of the content.'),
  questions: z.array(QuestionSchema).describe('An array of generated questions.'),
});

export async function generateContent(input: AIContentGeneratorInput): Promise<AIContentGeneratorOutput> {
  return generateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiContentGeneratorPrompt',
  input: { schema: AIContentGeneratorInputSchema },
  output: { schema: AIContentGeneratorOutputSchema },
  prompt: `You are an expert at creating educational content. Your task is to generate a {{contentType}} about "{{topic}}".

The content should have the following properties:
- Number of questions: {{numQuestions}}
- Difficulty level: {{difficulty}}

Please generate a title, a description, and the specified number of questions.
For each question, provide:
- The question text.
- The question type (either 'Multiple Choice', 'True/False', or 'Short Answer').
- The marks for the question (default to 1).
- For 'Multiple Choice' questions, provide exactly 4 options.
- The correct answer.

Ensure the generated content is accurate and relevant to the topic.
The questions should be diverse and test different aspects of the topic.
`,
});

const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContentFlow',
    inputSchema: AIContentGeneratorInputSchema,
    outputSchema: AIContentGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
