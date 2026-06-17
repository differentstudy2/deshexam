import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { reviews, institutionName } = await req.json();

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ error: 'No reviews provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    Analyze the following student/parent reviews for the educational institution named "${institutionName}".
    
    Reviews:
    ${reviews.map((r: any, i: number) => `Review ${i+1} (${r.rating} stars): "${r.text}"`).join('\n\n')}
    
    Please provide a concise, high-quality summary of the general sentiment. 
    Include a short "Pros" and "Cons" list if applicable, and a 1-2 sentence overall conclusion.
    Format the response using Markdown. Keep it under 150 words.
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('AI summarize-reviews error:', error);
    return NextResponse.json({ error: 'Failed to process AI summary request', details: String(error) }, { status: 500 });
  }
}
