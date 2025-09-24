import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' });
    }

    // Validate file type
    const validExtensions = ['.pth', '.zip', '.safetensors'];
    const fileExtension = path.extname(file.name).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Please upload .pth, .zip, or .safetensors files only.' 
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename to prevent conflicts
    const fileId = crypto.randomUUID();
    const fileName = `${fileId}_${file.name}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Basic file analysis
    const fileStats = {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: fileExtension,
      uploadTime: new Date().toISOString(),
      fileId: fileId,
      path: filePath
    };

    console.log('File uploaded successfully:', fileStats);

    return NextResponse.json({ 
      success: true, 
      fileId: fileId,
      fileInfo: fileStats,
      message: 'File uploaded successfully' 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file' 
    });
  }
}