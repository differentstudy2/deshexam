
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
  options: z.array(z.object({ text: z.string(), explanation: z.string().optional() })).optional().describe('An array of options for Multiple Choice questions, each with text and an optional explanation.'),
  correctAnswer: z.string().describe('The correct answer for the question.'),
  explanation: z.string().optional().describe('A general explanation for the correct answer.'),
});

const AIContentGeneratorInputSchema = z.object({
  contentType: z.string().describe('The type of content to generate (e.g., "Mock Test", "Quiz").'),
  numQuestions: z.number().int().min(1).describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the questions.'),
  sourceType: z.enum(['topic', 'text']).describe('The source of the content to be generated.'),
  source: z.string().describe('The source topic or text content.'),
});
export type AIContentGeneratorInput = z.infer<typeof AIContentGeneratorInputSchema>;


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
  prompt: `You are an expert at creating educational content. Your task is to generate a {{contentType}} based on the provided source.

The content should have the following properties:
- Number of questions: {{numQuestions}}
- Difficulty level: {{difficulty}}

{{#if isTopic}}
The topic for the content is "{{source}}".
{{else}}
The source text for the content is:
---
{{source}}
---
{{/if}}


Please generate a suitable title, a brief description, and the specified number of questions based on the source.
For each question, provide:
- The question text.
- The question type (either 'Multiple Choice', 'True/False', or 'Short Answer').
- The marks for the question (default to 1).
- For 'Multiple Choice' questions, provide exactly 4 options. For each option, provide the option text and a brief explanation. The explanation should explicitly state why the option is correct or incorrect. For example: "This is correct because..." or "This is incorrect because...".
- The correct answer.
- A general explanation for the correct answer that summarizes the main concept.

Ensure the generated content is accurate and relevant to the provided source.
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
    const isTopic = input.sourceType === 'topic';
    const { output } = await prompt({ ...input, isTopic });
    return output!;
  }
);
