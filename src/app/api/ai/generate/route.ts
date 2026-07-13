import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 2000,
            }
        })
    });

    const data = await response.json();
    let result = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
        throw new Error('Failed to generate content from Gemini');
    }

    try {
        let cleanResultText = result.trim();
        // Remove ```html, ```xml, or just ``` along with the newline
        cleanResultText = cleanResultText.replace(/```[a-zA-Z]*\n?/g, '').trim();
        return NextResponse.json({ result: cleanResultText });
    } catch (parseError) {
        console.error('Failed to parse AI response:', result);
        return NextResponse.json({ error: 'Failed to process AI response' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
