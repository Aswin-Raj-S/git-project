import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple file-based database for reports (can be replaced with actual database later)
const REPORTS_DIR = path.join(process.cwd(), 'data', 'reports');

// Interface for stored reports
interface StoredReport {
  code: string;
  analysisResult: any;
  timestamp: string;
  fileName: string;
  expiresAt: string;
}

// Ensure reports directory exists
async function ensureReportsDir() {
  try {
    await fs.access(REPORTS_DIR);
  } catch {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
  }
}

// Generate unique 8-character report code
function generateReportCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Check if code already exists
async function codeExists(code: string): Promise<boolean> {
  try {
    const filePath = path.join(REPORTS_DIR, `${code}.json`);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Generate unique code (retry if collision)
async function generateUniqueCode(): Promise<string> {
  let code = generateReportCode();
  let attempts = 0;
  
  while (await codeExists(code) && attempts < 10) {
    code = generateReportCode();
    attempts++;
  }
  
  if (attempts >= 10) {
    throw new Error('Failed to generate unique code');
  }
  
  return code;
}

export async function POST(request: NextRequest) {
  try {
    await ensureReportsDir();
    
    const { analysisResult } = await request.json();
    
    if (!analysisResult) {
      return NextResponse.json(
        { success: false, error: 'Analysis result is required' },
        { status: 400 }
      );
    }

    // Generate unique report code
    const reportCode = await generateUniqueCode();
    
    // Create report data
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    
    const storedReport: StoredReport = {
      code: reportCode,
      analysisResult,
      timestamp: now.toISOString(),
      fileName: analysisResult.fileName,
      expiresAt: expiresAt.toISOString()
    };

    // Save to file
    const filePath = path.join(REPORTS_DIR, `${reportCode}.json`);
    await fs.writeFile(filePath, JSON.stringify(storedReport, null, 2));

    return NextResponse.json({
      success: true,
      reportCode,
      message: 'Report saved successfully'
    });

  } catch (error) {
    console.error('Error saving report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save report' },
      { status: 500 }
    );
  }
}