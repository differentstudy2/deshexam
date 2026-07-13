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
  let tempFilePaths: string[] = [];
  let geminiFileNames: string[] = [];

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const { prompt, fileUrl, mimeType, files } = await req.json();

    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

    // Normalize to array
    const filesToProcess = files || [];
    if (fileUrl) {
      filesToProcess.push({ url: fileUrl, mimeType: mimeType || 'application/pdf' });
    }

    if (filesToProcess.length === 0) return NextResponse.json({ error: 'No files provided' }, { status: 400 });

    let fileParts: any[] = [];
    const tempDir = os.tmpdir();

    // 1 & 2. Download and upload all files
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const res = await fetch(file.url);
      if (!res.ok) throw new Error(`Failed to download file ${i + 1} from URL`);
      
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const ext = file.mimeType === 'application/pdf' ? '.pdf' : '.png';
      const tempPath = path.join(tempDir, `ai_upload_${Date.now()}_${i}${ext}`);
      await fs.writeFile(tempPath, buffer);
      tempFilePaths.push(tempPath);

      const uploadResult = await fileManager.uploadFile(tempPath, {
        mimeType: file.mimeType || 'application/pdf',
        displayName: `User Uploaded Document ${i + 1}`,
      });
      geminiFileNames.push(uploadResult.file.name);

      fileParts.push({
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      });
    }

    // 3. Generate Content using the Gemini File API reference
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using Flash for file analysis

    const result = await model.generateContent([
      prompt,
      ...fileParts
    ]);

    const response = await result.response;
    let generatedText = response.text();
    
    // Clean up potential markdown formatting from the response
    if (generatedText) {
      // Remove ```html, ```xml, or just ``` along with the newline
      generatedText = generatedText.replace(/```[a-zA-Z]*\n?/g, '').trim();
    }

    // Clean up files asynchronously
    tempFilePaths.forEach(p => fs.unlink(p).catch(console.error));
    geminiFileNames.forEach(n => fileManager.deleteFile(n).catch(console.error));

    return NextResponse.json({ result: generatedText });

  } catch (error: any) {
    console.error('AI File Generation Error:', error);
    
    // Clean up files in case of error
    tempFilePaths.forEach(p => fs.unlink(p).catch(console.error));
    geminiFileNames.forEach(n => fileManager.deleteFile(n).catch(console.error));

    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
