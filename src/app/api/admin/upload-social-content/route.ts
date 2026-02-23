// ============================================================
// API: Upload Social Content Assets
// Handles image uploads for social media content library (max 10MB)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const adminContext = await getAdminUser();

    if (!adminContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PNG, JPG, SVG' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `social-${timestamp}.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'social-content');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
    }

    // Save to public/social-content
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/social-content/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
