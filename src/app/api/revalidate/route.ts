import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tag = searchParams.get('tag');
  const path = searchParams.get('path');
  const secret = searchParams.get('secret');

  // Optional: add a secret token here to protect this route in production
  // if (secret !== process.env.REVALIDATION_SECRET) {
  //   return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  // }

  if (tag) {
    revalidateTag(tag);
    return NextResponse.json({ revalidated: true, type: 'tag', target: tag, now: Date.now() });
  }

  if (path) {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, type: 'path', target: path, now: Date.now() });
  }

  return NextResponse.json({ message: 'Missing tag or path parameter' }, { status: 400 });
}
