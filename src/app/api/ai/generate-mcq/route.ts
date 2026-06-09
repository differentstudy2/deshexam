import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const systemInstruction = `You are an expert exam question generator. 
Generate multiple choice questions based on the prompt.
Return ONLY a raw JSON array (no markdown code blocks, no backticks).
The format MUST exactly match:
[
  {
    "questionText": "What is 2+2?",
    "options": {
      "a": "3",
      "b": "4",
      "c": "5",
      "d": "6"
    },
    "correctAnswer": "b",
    "explanation": "2+2 equals 4."
  }
]`;

    // Using gemini-flash-latest
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
            parts: { text: systemInstruction }
        },
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", errorText);
        return NextResponse.json({ error: `Gemini API returned an error: ${response.statusText}` }, { status: 500 });
    }

    const data = await response.json();
    let textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResult) {
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }

    // Attempt to parse to ensure it's valid JSON
    let parsedJson;
    try {
        parsedJson = JSON.parse(textResult);
    } catch(e) {
        // Fallback cleanup if the model still wrapped in markdown
        textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedJson = JSON.parse(textResult);
    }

    return NextResponse.json(parsedJson);
  } catch (error: any) {
    console.error('Error generating MCQ:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
