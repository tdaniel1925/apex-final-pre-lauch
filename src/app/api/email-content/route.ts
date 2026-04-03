import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const emailPath = searchParams.get('path');

    if (!emailPath) {
      return new NextResponse('Email path is required', { status: 400 });
    }

    // Security: Only allow paths within /examples/emails/
    if (!emailPath.startsWith('/examples/emails/')) {
      return new NextResponse('Invalid email path', { status: 403 });
    }

    // Read the email HTML file from the public directory
    const filePath = join(process.cwd(), 'public', emailPath);
    const content = await readFile(filePath, 'utf-8');

    // Return the HTML content with proper headers
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'",
      },
    });
  } catch (error) {
    console.error('Error loading email content:', error);
    return new NextResponse('Email not found', { status: 404 });
  }
}
