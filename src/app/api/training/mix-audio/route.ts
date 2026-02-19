// =============================================
// Mix Audio API
// Combines intro, main content, outro, and background music
// Uses ffmpeg for professional audio mixing
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];

  try {
    const {
      introUrl,
      mainUrl,
      outroUrl,
      musicUrl,
      musicVolume = 20,
      episodeId,
    } = await request.json();

    if (!mainUrl || !episodeId) {
      return NextResponse.json(
        { success: false, error: 'Main audio URL and episode ID are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const tempDir = path.join(process.cwd(), 'temp');

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Helper to download and save file
    const downloadFile = async (url: string, filename: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to download ${filename}`);

      const buffer = await response.arrayBuffer();
      const filepath = path.join(tempDir, filename);
      fs.writeFileSync(filepath, Buffer.from(buffer));
      tempFiles.push(filepath);
      return filepath;
    };

    // Download all audio files
    const introPath = introUrl ? await downloadFile(introUrl, `intro-${episodeId}.mp3`) : null;
    const mainPath = await downloadFile(mainUrl, `main-${episodeId}.mp3`);
    const outroPath = outroUrl ? await downloadFile(outroUrl, `outro-${episodeId}.mp3`) : null;
    const musicPath = musicUrl ? await downloadFile(musicUrl, `music-${episodeId}.mp3`) : null;

    const outputPath = path.join(tempDir, `episode-final-${episodeId}.mp3`);
    tempFiles.push(outputPath);

    // Build ffmpeg command
    let command = '';

    if (musicPath) {
      // Complex mix with background music
      const parts = [introPath, mainPath, outroPath].filter((p): p is string => Boolean(p));
      const concatListPath = path.join(tempDir, `concat-${episodeId}.txt`);
      const concatList = parts.map((p) => `file '${p}'`).join('\n');
      fs.writeFileSync(concatListPath, concatList);
      tempFiles.push(concatListPath);

      // Concatenate voice parts, then mix with background music
      command = `ffmpeg -f concat -safe 0 -i "${concatListPath}" -stream_loop -1 -i "${musicPath}" -filter_complex "[1:a]volume=${
        musicVolume / 100
      },afade=t=in:st=0:d=2,afade=t=out:st=END-2:d=2[music];[0:a][music]amix=inputs=2:duration=first:dropout_transition=2[out]" -map "[out]" -ac 2 -ar 44100 -b:a 192k "${outputPath}"`;
    } else {
      // Simple concatenation without music
      const parts = [introPath, mainPath, outroPath].filter((p): p is string => Boolean(p));

      if (parts.length === 1) {
        // Just copy the file
        fs.copyFileSync(parts[0], outputPath);
      } else {
        // Concatenate multiple files
        const concatListPath = path.join(tempDir, `concat-${episodeId}.txt`);
        const concatList = parts.map((p) => `file '${p}'`).join('\n');
        fs.writeFileSync(concatListPath, concatList);
        tempFiles.push(concatListPath);

        command = `ffmpeg -f concat -safe 0 -i "${concatListPath}" -c copy "${outputPath}"`;
      }
    }

    // Execute ffmpeg
    if (command) {
      await execPromise(command);
    }

    // Get audio duration
    const { stdout: durationOutput } = await execPromise(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`
    );
    const duration = Math.floor(parseFloat(durationOutput));

    // Upload final mixed audio
    const finalBuffer = fs.readFileSync(outputPath);
    const finalFileName = `episodes/episode-${episodeId}.mp3`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('training-audio')
      .upload(finalFileName, finalBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('training-audio').getPublicUrl(uploadData.path);

    // Clean up temp files
    tempFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch (e) {
          console.error(`Failed to delete ${file}:`, e);
        }
      }
    });

    return NextResponse.json({
      success: true,
      audioUrl: publicUrl,
      duration,
    });
  } catch (error: any) {
    console.error('Audio mixing error:', error);

    // Clean up temp files on error
    tempFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch (e) {
          console.error(`Failed to delete ${file}:`, e);
        }
      }
    });

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
