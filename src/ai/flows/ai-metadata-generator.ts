
'use server';
/**
 * @fileOverview Generates a list of metadata items (like subjects, boards, etc.) based on a topic.
 *
 * - generateMetadata - A function that generates a list of metadata items.
 * - AIMetadataGeneratorInput - The input type for the function.
 * - AIMetadataGeneratorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AIMetadataGeneratorInputSchema = z.object({
  metafieldType: z.enum(['Subject', 'Board', 'Exam Category', 'Class', 'State']).describe('The type of metadata to generate.'),
  topic: z.string().describe('The high-level topic or category to generate items for (e.g., "Indian Competitive Exams", "High School Science").'),
  count: z.number().int().min(1).max(20).describe('The number of items to generate.'),
});
export type AIMetadataGeneratorInput = z.infer<typeof AIMetadataGeneratorInputSchema>;

const AIMetadataGeneratorOutputSchema = z.object({
  items: z.array(z.string()).describe('An array of generated metadata item names.'),
});
export type AIMetadataGeneratorOutput = z.infer<typeof AIMetadataGeneratorOutputSchema>;

export async function generateMetadata(input: AIMetadataGeneratorInput): Promise<AIMetadataGeneratorOutput> {
  return generateMetadataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMetadataGeneratorPrompt',
  input: { schema: AIMetadataGeneratorInputSchema },
  output: { schema: AIMetadataGeneratorOutputSchema },
  prompt: `You are an expert in educational content structures. Your task is to generate a list of relevant metadata items based on a given topic and type.

Generate a list of {{count}} {{metafieldType}} names related to the topic: "{{topic}}".

For example, if the metafield type is "Subject" and the topic is "High School Science", you might generate: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science"].
If the metafield type is "Exam Category" and the topic is "Indian Government Jobs", you might generate: ["UPSC", "SSC", "Banking", "Railways", "State PSC"].

Return ONLY the list of generated item names. Do not include any other information.
`,
});

const generateMetadataFlow = ai.defineFlow(
  {
    name: 'generateMetadataFlow',
    inputSchema: AIMetadataGeneratorInputSchema,
    outputSchema: AIMetadataGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
