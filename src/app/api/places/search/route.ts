import { NextResponse } from 'next/server';

// All Google Places API types that could be an educational institution
const EDUCATIONAL_TYPES = new Set([
  'school',
  'primary_school',
  'secondary_school',
  'university',
  'library',
  'book_store',
  'local_government_office', // government-run institutions sometimes tagged this way
]);

// Name-based keywords — coaching centers, academies, etc. don't have a
// dedicated Google type so we fall back to checking the place name itself
const EDUCATIONAL_NAME_KEYWORDS = [
  'school',
  'college',
  'university',
  'institute',
  'institution',
  'academy',
  'coaching',
  'tuition',
  'tutorial',
  'training',
  'vidyalaya',
  'vidyapith',
  'mahavidyalaya',
  'pathshala',
  'polytechnic',
  'iit',
  'nit',
  'iim',
  'seminary',
  'nursery',
  'kindergarten',
  'playschool',
  'pre-school',
  'preschool',
  'high school',
  'middle school',
];

function isEducational(place: { types: string[]; name: string }): boolean {
  // Pass 1: Google type match
  if (place.types.some((t) => EDUCATIONAL_TYPES.has(t))) return true;

  // Pass 2: name keyword match (for coaching centers, academies, etc.)
  const nameLower = place.name.toLowerCase();
  return EDUCATIONAL_NAME_KEYWORDS.some((kw) => nameLower.includes(kw));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
  }

  try {
    // Bias Google's Text Search toward educational places by appending keywords
    const educationalQuery = `${query} school OR college OR university OR institute OR coaching OR academy`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(educationalQuery)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Maps Search API Error:', data);
      return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 });
    }

    const allResults = (data.results || []).map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      location: place.geometry?.location,
      types: place.types || [],
    }));

    // Apply dual filter: Google type OR educational name keyword
    const results = allResults.filter(isEducational);

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Error in places search:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
