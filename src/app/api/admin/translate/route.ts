import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, targetLanguage = 'English' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const prompt = `Translate the following content into ${targetLanguage}. Maintain all HTML tags, TipTap editor formatting, CSS classes, markdown, and KaTeX math formulas EXACTLY as they are. Only translate the human-readable text. Do not wrap the output in markdown code blocks. Here is the content:\n\n${text}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 8192,
            }
        })
    });

    const data = await response.json();
    let result = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
        throw new Error('Failed to generate translation from Gemini');
    }

    // Clean up markdown code block wrappers if Gemini accidentally includes them despite instructions
    if (result.startsWith('```html')) {
      result = result.replace(/^```html\s*/, '').replace(/\s*```$/, '');
    } else if (result.startsWith('```')) {
      result = result.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('AI Translation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
