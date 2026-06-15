'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const generateMockTestMetadata = async (topic: string) => {
  try {
    const response = await ai.generate({
      prompt: `You are an expert SEO copywriter and educator for a mock test platform. 
      The admin wants to create a mock test about: "${topic}".
      Please generate the following fields for this mock test:
      - title: A catchy, SEO-friendly title (e.g., "WBCS Prelims Full Length Mock Test 1").
      - slug: A URL-friendly slug based on the title (e.g., "wbcs-prelims-mock-test-1").
      - description: A compelling, 2-3 sentence meta description to attract students and rank well on Google.
      - instructions: A helpful list of instructions for taking the exam (e.g., mentioning negative marking, time limits, or general tips). Keep it formatted nicely.`,
      output: {
        schema: z.object({
          title: z.string(),
          slug: z.string(),
          description: z.string(),
          instructions: z.string(),
        })
      }
    });

    // Genkit puts structured output in response.output
    const data = response.output;

    return { success: true, data };
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    const msg = error?.message || error?.toString() || "Unknown error occurred";
    return { success: false, error: msg };
  }
};
