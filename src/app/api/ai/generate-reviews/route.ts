import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { institutionName, count } = await req.json();

    if (!institutionName || !count) {
      return NextResponse.json({ error: 'Institution name and count are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are an AI assistant tasked with generating realistic, helpful student or parent reviews for an educational institution named "${institutionName}".
    
    Generate exactly ${count} simulated reviews. 
    Make the reviews varied in sentiment (mostly positive, but include minor criticisms to look authentic), tone, and perspective (e.g., current student, alumni, parent).
    Each review must have the following fields:
    - authorName: A realistic Indian name (first and last).
    - rating: A number between 3 and 5 (use some 4s and 5s, maybe one 3 if ${count} > 3).
    - text: The content of the review, typically 1 to 3 sentences long.
    - time: A realistic date string in the format "DD.MM.YYYY" (e.g., "14.08.2023"). Make them recent but spread out over the last year or two.
    - authorPhotoUrl: Always use this exact string format replacing NAME with the first name generated: "https://ui-avatars.com/api/?name=NAME&background=random"

    Return the response strictly as a JSON array of objects without any markdown formatting or code block wrappers (do not use \`\`\`json). Just the raw JSON array.
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    // Clean up potential markdown code blocks if the AI accidentally adds them
    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const generatedReviews = JSON.parse(cleanJson);

    return NextResponse.json({ reviews: generatedReviews });
  } catch (error) {
    console.error('AI generate-reviews error:', error);
    return NextResponse.json({ error: 'Failed to generate reviews', details: String(error) }, { status: 500 });
  }
}
