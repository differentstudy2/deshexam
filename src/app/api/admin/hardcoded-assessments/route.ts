import { NextResponse } from 'next/server';
import { getAllHardcodedMockTests, getAllHardcodedQuizzes, getAllHardcodedPracticeSets } from '@/lib/hardcoded-loader';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let data: any[] = [];
    if (type === 'mockTests') {
      data = getAllHardcodedMockTests();
    } else if (type === 'quizzes') {
      data = getAllHardcodedQuizzes();
    } else if (type === 'practiceSets') {
      data = getAllHardcodedPracticeSets();
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Mark them as hardcoded so the admin UI can differentiate if needed
    const enrichedData = data.map(item => ({
      ...item,
      isHardcoded: true,
      // Provide a mock ID if it doesn't have one, though hardcoded items should have an ID
      id: item.id || item.slug
    }));

    return NextResponse.json({ assessments: enrichedData });
  } catch (error) {
    console.error('[API] Error fetching hardcoded assessments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
