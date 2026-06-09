import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { questionText, taxonomyPath } = await req.json();

    if (!questionText) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const prompt = `
    You are an SEO expert. Generate an optimized SEO Title and Meta Description for the following academic question.
    
    Question: ${questionText}
    Category context: ${taxonomyPath || 'General'}

    Return ONLY a valid JSON object with exactly two keys: "title" and "description". Do not include markdown formatting or \`\`\`json wrappers.
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
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
