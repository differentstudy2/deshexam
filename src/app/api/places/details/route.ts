import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'Query parameter "placeId" is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
  }

  try {
    // Fields to fetch
    const fields = [
      'name',
      'formatted_address',
      'geometry',
      'rating',
      'user_ratings_total',
      'formatted_phone_number',
      'international_phone_number',
      'opening_hours',
      'reviews',
      'photos',
      'website',
      'place_id'
    ].join(',');

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Maps Details API Error:', data);
      return NextResponse.json({ error: 'Failed to fetch place details' }, { status: 500 });
    }

    const place = data.result;

    // Process Photos: Just return the photo references. The frontend will trigger an upload.
    const photos = place.photos ? place.photos.map((p: any) => p.photo_reference) : [];

    // Process Reviews
    const reviews = place.reviews ? place.reviews.map((r: any) => ({
      authorName: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.relative_time_description,
      authorPhotoUrl: r.profile_photo_url,
    })) : [];

    // Process Opening Hours
    const openingHours = place.opening_hours?.weekday_text || [];

    const detailedResult = {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      latitude: place.geometry?.location?.lat,
      longitude: place.geometry?.location?.lng,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      websiteUrl: place.website,
      phoneNumber: place.formatted_phone_number,
      internationalPhoneNumber: place.international_phone_number,
      openingHours,
      reviews,
      photoReferences: photos, // Array of Google Maps photo references
    };

    return NextResponse.json(detailedResult);
  } catch (error) {
    console.error('Error in place details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
