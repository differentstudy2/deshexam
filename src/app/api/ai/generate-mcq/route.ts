import { verifyAuthToken } from '@/lib/firebase/auth-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const decodedToken = await verifyAuthToken(request as any);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
Ensure the questions are of HIGH QUALITY, STANDARD, and test deep understanding rather than simple recall.
Create plausible and tricky distractors (wrong options) to properly test the student.
The length of the questions should be perfectly balanced for a board exam standard.
IMPORTANT: Option text MUST be extremely short and concise (typically 1-4 words). NEVER write full sentences, explanations, or examples inside the options. Explanations belong ONLY in the 'optionExplanations' and 'explanation' fields.
Return ONLY a raw JSON array (no markdown code blocks, no backticks).
The format MUST exactly match:
[
  {
    "questionText": "ভাষার বা শব্দের ক্ষুদ্রতম অংশকে কী বলে?",
    "options": {
      "a": "ধ্বনি",
      "b": "বর্ণ",
      "c": "বাক্য",
      "d": "শব্দ"
    },
    "correctAnswer": "a",
    "explanation": "মানুষের মুখের উচ্চারিত শব্দের ক্ষুদ্রতম অংশকে ধ্বনি বলে।",
    "optionExplanations": {
      "a": "সঠিক! শব্দের ক্ষুদ্রতম একক হল ধ্বনি।",
      "b": "বর্ণ হলো ধ্বনির লিখিত রূপ, শব্দের ক্ষুদ্রতম অংশ নয়।",
      "c": "বাক্য হলো একাধিক শব্দের সমষ্টি।",
      "d": "শব্দ হলো ধ্বনির সমষ্টি।"
    }
  }
]`;

    // Using gemini-2.5-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
            parts: [{ text: systemInstruction }]
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
        if (response.status === 429) {
            return NextResponse.json({ error: `Rate limit exceeded. Please wait 30-60 seconds before trying again.` }, { status: 429 });
        }
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
