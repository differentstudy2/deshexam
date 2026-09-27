import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch from YouTube (Status: ${res.status})`);
    }
    
    const html = await res.text();
    
    // Parse ytInitialPlayerResponse from the page source
    const match = html.match(/var ytInitialPlayerResponse = (\{.*?\});/);
    if (match && match[1]) {
      const data = JSON.parse(match[1]);
      const videoDetails = data.videoDetails;
      
      if (!videoDetails) {
        return NextResponse.json({ error: 'Video details not found' }, { status: 404 });
      }

      // Convert duration in seconds to MM:SS format
      const seconds = parseInt(videoDetails.lengthSeconds || '0', 10);
      let durationStr = '';
      if (seconds > 0) {
        const mm = Math.floor(seconds / 60);
        const ss = seconds % 60;
        durationStr = `${mm}:${ss.toString().padStart(2, '0')}`;
      }

      const thumbnails = videoDetails.thumbnail?.thumbnails || [];
      const bestThumbnail = thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : `https://img.youtube.com/vi/${videoDetails.videoId}/maxresdefault.jpg`;

      return NextResponse.json({
        title: videoDetails.title,
        description: videoDetails.shortDescription,
        author_name: videoDetails.author,
        duration: durationStr,
        thumbnail_url: bestThumbnail,
        video_id: videoDetails.videoId
      });
    }

    return NextResponse.json({ error: 'Could not parse metadata. Make sure this is a valid YouTube video URL.' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
