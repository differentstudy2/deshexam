'use server';
/**
 * @fileOverview Generates a personalized learning path based on mock test results.
 *
 * - generateLearningPath - A function that generates the learning path.
 * - LearningPathInput - The input type for the generateLearningPath function.
 * - LearningPathOutput - The return type for the generateLearningPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningPathInputSchema = z.object({
  testResults: z
    .string()
    .describe('The mock test results, including scores and areas for improvement.'),
  studentGoals: z.string().optional().describe('The student goals for studying.'),
});
export type LearningPathInput = z.infer<typeof LearningPathInputSchema>;

const LearningPathOutputSchema = z.object({
  learningPath: z.string().describe('A personalized learning path for the student.'),
  weakAreas: z.string().describe('The weak areas of the student.'),
  studyPlan: z.string().describe('A study plan for the student.'),
});
export type LearningPathOutput = z.infer<typeof LearningPathOutputSchema>;

export async function generateLearningPath(input: LearningPathInput): Promise<LearningPathOutput> {
  return generateLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learningPathPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: LearningPathInputSchema},
  output: {schema: LearningPathOutputSchema},
  prompt: `You are an AI learning path generator that helps students to improve their understanding of the subjects.

Analyze the mock test results and generate a personalized learning path that highlights weak areas and provides a study plan.

Test Results: {{{testResults}}}
Student Goals: {{{studentGoals}}}

Based on the test results, identify the weak areas of the student and create a study plan to help them improve.

Learning Path:
Weak Areas:
Study Plan: `,
});

const generateLearningPathFlow = ai.defineFlow(
  {
    name: 'generateLearningPathFlow',
    inputSchema: LearningPathInputSchema,
    outputSchema: LearningPathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
