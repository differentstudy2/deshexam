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
    3. Medium of Instruction (e.g. ["English", "Bengali", "Hindi"])
    4. Official Social Media Profiles (Facebook, Twitter/X, LinkedIn, Instagram, YouTube)
    5. Full Description: Write a high-quality, comprehensive article-style overview (about 400 to 500 words) detailing the history, academic curriculum, campus facilities, notable achievements, and overall reputation of the institution. Format the response beautifully using **HTML tags**. DO NOT write an overall main title or <h1> tag at the top of the description. Instead, start directly with the content and divide the text into logical sections using appropriate <h2> tags for section headers. Do not use Markdown, strictly use HTML tags.
    6. High Quality SEO Title: Write an optimized, catchy page title (max 60 characters) including the institution name and primary location.
    7. High Quality SEO Description: Write a compelling, concise meta description (max 160 characters) summarizing the institution for search engines.
    
    Respond STRICTLY in JSON format with exactly these keys:
    {
      "establishedYear": "string or null",
      "totalEnrollment": number or null,
      "mediumOfInstruction": ["string"],
      "socialProfiles": {
        "facebook": "url or null",
        "twitter": "url or null",
        "linkedin": "url or null",
        "instagram": "url or null",
        "youtube": "url or null"
      },
      "description": "string or null",
      "seoTitle": "string or null",
      "seoDescription": "string or null"
    }
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText = result.response.text();
    let cleanText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    try {
      const data = JSON.parse(cleanText);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('Failed to parse AI JSON:', cleanText);
      return NextResponse.json({ error: 'AI returned invalid JSON format', details: cleanText }, { status: 500 });
    }

  } catch (error) {
    console.error('AI fill-details error:', error);
    return NextResponse.json({ error: 'Failed to process AI request', details: String(error) }, { status: 500 });
  }
}
