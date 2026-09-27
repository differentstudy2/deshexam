'use server';

export async function getGoogleMapsKey() {
  return process.env.GOOGLE_MAPS_API_KEY || '';
}
