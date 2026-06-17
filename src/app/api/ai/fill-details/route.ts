import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { name, address } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Institution name is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We use gemini-2.5-flash as it supports search grounding
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: [{
        googleSearch: {}
      } as any]
    });

    const prompt = `
    Find the following information about the educational institution named "${name}" located at or near "${address || ''}".
    Please use Google Search to find accurate, up-to-date data.
    
    1. Established Year (e.g. "1945")
    2. Total Enrollment (a number, roughly estimated if exact is not available, e.g. 1500)
    3. Official Social Media Profiles (Facebook, Twitter/X, LinkedIn, Instagram, YouTube)
    4. Full Description: Write a high-quality, comprehensive article-style overview (about 400 to 500 words) detailing the history, academic curriculum, campus facilities, notable achievements, and overall reputation of the institution. Structure it with clear paragraphs separated by double newlines.
    5. High Quality SEO Description: Write a compelling, concise meta description (max 160 characters) summarizing the institution for search engines.
    
    Respond STRICTLY in JSON format with exactly these keys:
    {
      "establishedYear": "string or null",
      "totalEnrollment": number or null,
      "socialProfiles": {
        "facebook": "url or null",
        "twitter": "url or null",
        "linkedin": "url or null",
        "instagram": "url or null",
        "youtube": "url or null"
      },
      "description": "string or null",
      "seoDescription": "string or null"
    }
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText = result.response.text();
    // Strip markdown formatting if the model wraps it in ```json ... ```
    const cleanText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const data = JSON.parse(cleanText);

    return NextResponse.json(data);
  } catch (error) {
    console.error('AI fill-details error:', error);
    return NextResponse.json({ error: 'Failed to process AI request', details: String(error) }, { status: 500 });
  }
}
