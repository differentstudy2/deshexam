import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const { photoReference, placeId } = await request.json();

    if (!photoReference || !placeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
    }

    // Initialize admin if needed
    getAdminDb();
    const bucket = admin.storage().bucket('studio-8356746366-699c1.firebasestorage.app');

    // Download from Google Maps
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Google Maps Photo API Error:', response.statusText);
      return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
    }

    const buffer = await response.arrayBuffer();
    
    // Generate a unique filename
    const filename = `institutions/${placeId}/gallery_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const file = bucket.file(filename);

    // Upload to Firebase Storage
    await file.save(Buffer.from(buffer), {
      metadata: { contentType: 'image/jpeg' },
      public: true, // Make it public
    });

    // Construct the public URL
    // For firebasestorage.app buckets, the format is slightly different or we can use the download URL
    const encodedPath = encodeURIComponent(filename);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/studio-8356746366-699c1.firebasestorage.app/o/${encodedPath}?alt=media`;

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
