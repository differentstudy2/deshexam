import { NextResponse } from 'next/server';
import { getAssessments } from '@/lib/firebase/assessment';

export async function GET() {
  try {
    const quizzes = await getAssessments('quizzes');
    return NextResponse.json({ quizzes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
