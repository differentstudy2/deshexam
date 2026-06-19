import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const prompt = `
    You are an expert EdTech content creator for an online learning platform.
    Generate a highly professional, user-friendly FAQ based on the following topic or rough question.
    
    Topic: ${topic}

    Return ONLY a valid JSON object matching exactly this structure:
    {
      "question": "A polished, clear, professional question string",
      "answer": "A detailed, helpful, clear answer string (2-4 sentences max, can include basic HTML formatting if needed like <b> or <ul>)",
      "tags": ["1-3 relevant keywords as lowercase strings without spaces"],
      "seo": {
        "slug": "a-url-friendly-kebab-case-slug",
        "metaTitle": "A concise SEO optimized title (max 60 chars)",
        "metaDescription": "A helpful SEO optimized meta description (max 150 chars)"
      }
    }
    
    Do not include markdown formatting or \`\`\`json wrappers in your response. Just the raw JSON object.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        })
    });

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
        throw new Error('Failed to generate content from Gemini');
    }

    const parsed = JSON.parse(resultText);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('AI FAQ Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
