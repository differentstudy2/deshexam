import { verifyAuthToken } from '@/lib/firebase/auth-server';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Allow this route to run up to 5 minutes to handle downloading and processing large files
export const maxDuration = 300; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  let tempFilePath: string | null = null;
  let geminiFileName: string | null = null;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const { prompt, fileUrl, mimeType } = await req.json();

    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    if (!fileUrl) return NextResponse.json({ error: 'File URL is required' }, { status: 400 });

    // 1. Download the file from Firebase Storage to a local temporary file
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error('Failed to download file from URL');
    
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `ai_upload_${Date.now()}.pdf`);
    await fs.writeFile(tempFilePath, buffer);

    // 2. Upload to Gemini File API (Supports up to 2GB)
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: mimeType || 'application/pdf',
      displayName: 'User Uploaded Document',
    });
    geminiFileName = uploadResult.file.name;

    // 3. Generate Content using the Gemini File API reference
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using Flash for file analysis

    const result = await model.generateContent([
      prompt,
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      }
    ]);

    const response = await result.response;
    let generatedText = response.text();
    
    // Clean up potential markdown formatting from the response
    if (generatedText) {
      generatedText = generatedText.replace(/```(html)?/gi, '').trim();
    }

    // Clean up files asynchronously
    if (tempFilePath) fs.unlink(tempFilePath).catch(console.error);
    if (geminiFileName) fileManager.deleteFile(geminiFileName).catch(console.error);

    return NextResponse.json({ result: generatedText });

  } catch (error: any) {
    console.error('AI File Generation Error:', error);
    
    // Clean up files in case of error
    if (tempFilePath) fs.unlink(tempFilePath).catch(console.error);
    if (geminiFileName) fileManager.deleteFile(geminiFileName).catch(console.error);

    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
