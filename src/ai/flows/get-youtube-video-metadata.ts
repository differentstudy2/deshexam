'use server';
/**
 * @fileOverview Fetches metadata (title, thumbnail) for a given YouTube video URL.
 *
 * - getYoutubeVideoMetadata - A function that fetches YouTube video metadata.
 * - YoutubeVideoMetadataInput - The input type for the function.
 * - YoutubeVideoMetadataOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const YoutubeVideoMetadataInputSchema = z.object({
  url: z.string().url().describe('The URL of the YouTube video.'),
});
export type YoutubeVideoMetadataInput = z.infer<typeof YoutubeVideoMetadataInputSchema>;

const YoutubeVideoMetadataOutputSchema = z.object({
  title: z.string().describe('The title of the YouTube video.'),
  thumbnailUrl: z.string().url().describe('The URL of the video thumbnail.'),
});
export type YoutubeVideoMetadataOutput = z.infer<typeof YoutubeVideoMetadataOutputSchema>;


export async function getYoutubeVideoMetadata(input: YoutubeVideoMetadataInput): Promise<YoutubeVideoMetadataOutput> {
  return getYoutubeVideoMetadataFlow(input);
}


function getYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

const getYoutubeVideoMetadataFlow = ai.defineFlow(
  {
    name: 'getYoutubeVideoMetadataFlow',
    inputSchema: YoutubeVideoMetadataInputSchema,
    outputSchema: YoutubeVideoMetadataOutputSchema,
  },
  async ({ url }) => {
    const videoId = getYouTubeId(url);
    if (!videoId) {
        throw new Error('Invalid YouTube URL provided.');
    }

    try {
        const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch YouTube metadata: ${response.statusText}`);
        }
        const data = await response.json();
        
        return {
            title: data.title || 'Untitled YouTube Video',
            thumbnailUrl: data.thumbnail_url || '',
        };

    } catch (error) {
        console.error('Error fetching YouTube metadata:', error);
        // Fallback to a simpler title if the oEmbed fetch fails
        return {
            title: `YouTube Video: ${videoId}`,
            thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        }
    }
  }
);
