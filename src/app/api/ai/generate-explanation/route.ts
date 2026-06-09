import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { questionText, options, correctAnswer } = await req.json();

    if (!questionText) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const prompt = `
    You are an expert educator. Please provide a clear, concise, and helpful explanation for the following question.
    
    Question: ${questionText}
    ${options ? `Options: A) ${options.a} B) ${options.b} C) ${options.c} D) ${options.d}` : ''}
    Correct Answer: ${correctAnswer}

    Write a 2-3 paragraph explanation detailing why the correct answer is right, and optionally why the other common distractors are wrong.
    Do not repeat the question or start with "The correct answer is", just dive straight into the explanation.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 500,
            }
        })
    });

    const data = await response.json();
    const explanation = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!explanation) {
        throw new Error('Failed to generate content from Gemini');
    }

    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
