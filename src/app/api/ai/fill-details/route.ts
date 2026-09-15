import { verifyAuthToken } from '@/lib/firebase/auth-server';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/** Extracts the first valid JSON object from a string that may contain
 *  extra prose, markdown fences, or search-grounding citations. */
function extractJSON(text: string): string | null {
  // 1. Strip markdown code fences
  let cleaned = text
    .replace(/```json[\s\S]*?```/gi, (m) => m.replace(/```json/gi, '').replace(/```/gi, ''))
    .replace(/```[\s\S]*?```/gi, (m) => m.replace(/```/gi, ''))
    .trim();

  // 2. Find the first '{' and last '}' — grab everything in between
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return cleaned.slice(start, end + 1);
  }
  return null;
}

const PROMPT = (name: string, address: string) => `
Find the following information about the educational institution named "${name}" located at or near "${address}".
Use Google Search to find accurate, up-to-date data.

1. Established Year (e.g. "1945")
2. Total Enrollment (a number, roughly estimated if exact is not available, e.g. 1500)
3. Medium of Instruction (e.g. ["English", "Bengali", "Hindi"])
4. Official Social Media Profiles (Facebook, Twitter/X, LinkedIn, Instagram, YouTube)
5. Full Description: Write a high-quality, comprehensive article-style overview (about 400 to 500 words) detailing the history, academic curriculum, campus facilities, notable achievements, and overall reputation of the institution. Format the response beautifully using HTML tags. DO NOT write an overall main title or <h1> tag at the top. Start directly with content, divide into sections using <h2> tags. Do not use Markdown.
6. High Quality SEO Title: Write an optimized, catchy page title (max 60 characters) including the institution name and primary location.
7. High Quality SEO Description: Write a compelling meta description (max 160 characters) summarizing the institution for search engines.

You MUST respond with ONLY a raw JSON object — no markdown, no code fences, no explanation before or after:
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

export async function POST(request: Request) {
  try {
    const decodedToken = await verifyAuthToken(request as any);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, address } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Institution name is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = PROMPT(name, address || '');

    let responseText: string | null = null;

    // ── Strategy 1: gemini-2.0-flash with Google Search grounding ─────────────
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        tools: [{ googleSearch: {} } as any],
      });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      responseText = result.response.text();
    } catch (e1) {
      console.warn('Strategy 1 (gemini-2.0-flash + search) failed:', String(e1));

      // ── Strategy 2: gemini-2.0-flash without grounding ──────────────────────
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        responseText = result.response.text();
      } catch (e2) {
        console.warn('Strategy 2 (gemini-2.0-flash no search) failed:', String(e2));

        // ── Strategy 3: gemini-2.5-flash-lite (latest lightweight model) ────────
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          });
          responseText = result.response.text();
        } catch (e3) {
          console.warn('Strategy 3 (gemini-2.5-flash-lite) failed:', String(e3));
          // Re-throw the last error so outer catch captures it
          throw e3;
        }
      }
    }


    if (!responseText) {
      return NextResponse.json({ error: 'AI returned empty response' }, { status: 500 });
    }

    // Robustly extract JSON even when Gemini wraps with prose/citations
    const jsonStr = extractJSON(responseText);
    if (!jsonStr) {
      console.error('No JSON object found in AI response:', responseText);
      return NextResponse.json(
        { error: 'AI returned invalid JSON format', details: responseText },
        { status: 500 }
      );
    }

    try {
      const data = JSON.parse(jsonStr);
      return NextResponse.json(data);
    } catch {
      console.error('Failed to parse extracted JSON:', jsonStr);
      return NextResponse.json(
        { error: 'AI returned invalid JSON format', details: jsonStr },
        { status: 500 }
      );
    }

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('AI fill-details fatal error:', msg);
    return NextResponse.json(
      { error: 'Failed to process AI request', details: msg },
      { status: 500 }
    );
  }
}
