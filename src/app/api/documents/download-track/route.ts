import { NextResponse } from 'next/server';

// This is a lightweight analytics endpoint for tracking downloads.
// It just returns success since download tracking can be done client-side
// or you can add Firestore increment here if needed.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileUrl } = body;

    // Optional: persist to Firestore here
    // For now just acknowledge
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
