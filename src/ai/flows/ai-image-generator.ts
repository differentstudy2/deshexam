
'use server';
/**
 * @fileOverview Generates an image using an AI model.
 *
 * - generateImage - A function that generates an image based on a text prompt.
 * - AIImageGeneratorInput - The input type for the generateImage function.
 * - AIImageGeneratorOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const AIImageGeneratorInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type AIImageGeneratorInput = z.infer<typeof AIImageGeneratorInputSchema>;

const AIImageGeneratorOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type AIImageGeneratorOutput = z.infer<typeof AIImageGeneratorOutputSchema>;

export async function generateImage(input: AIImageGeneratorInput): Promise<AIImageGeneratorOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: AIImageGeneratorInputSchema,
    outputSchema: AIImageGeneratorOutputSchema,
  },
  async ({ prompt }) => {
    const { media } = await ai.generate({
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt,
    });
    
    const imageUrl = media.url;
    if (!imageUrl) {
        throw new Error('Image generation failed to return a URL.');
    }
    
    return { imageUrl };
  }
);
