import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'placeId parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
  }

  try {
    // We only request the fields we need to keep costs down and improve performance
    const fields = 'name,formatted_address,geometry,website,rating,user_ratings_total';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=${fields}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places Details error:', data);
      return NextResponse.json({ error: data.error_message || 'Failed to fetch place details' }, { status: 500 });
    }

    return NextResponse.json({ result: data.result });
  } catch (error) {
    console.error('Places API Details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
