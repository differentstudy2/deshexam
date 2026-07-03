import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { questionText, options, correctAnswer, language } = await req.json();

    if (!questionText) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const optionsText = options && Object.keys(options).length > 0 
      ? `Options: ${Object.entries(options).filter(([k,v]) => v).map(([k,v]) => `${k.toUpperCase()}) ${v}`).join(' ')}` 
      : '';

    const langInstruction = language ? `\n    IMPORTANT: You MUST write the ENTIRE explanation (both main and options) in ${language}.` : '';

    const prompt = `
    You are an expert educator. Please provide a clear, concise, and helpful explanation for the following question.${langInstruction}
    
    Question: ${questionText}
    ${optionsText}
    Correct Answer: ${correctAnswer}

    Generate a JSON object with the following structure:
    {
      "explanation": "A 2-3 paragraph main explanation detailing why the correct answer is right. Do not repeat the question or start with 'The correct answer is'.",
      "optionExplanations": {
        "a": "Explanation of why option A is right or wrong",
        "b": "Explanation of why option B is right or wrong",
        "c": "Explanation of why option C is right or wrong",
        "d": "Explanation of why option D is right or wrong"
      }
    }
    Make sure the response is valid JSON. Omit option keys that are not provided in the question.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 800,
                responseMimeType: "application/json",
            }
        })
    });

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
        throw new Error('Failed to generate content from Gemini');
    }

    try {
        const resultJson = JSON.parse(resultText);
        return NextResponse.json({ 
            explanation: resultJson.explanation,
            optionExplanations: resultJson.optionExplanations
        });
    } catch (parseError) {
        console.error('Failed to parse AI JSON:', resultText);
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
