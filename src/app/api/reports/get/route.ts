import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple file-based database for reports
const REPORTS_DIR = path.join(process.cwd(), 'data', 'reports');

interface StoredReport {
  code: string;
  analysisResult: any;
  timestamp: string;
  fileName: string;
  expiresAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.toUpperCase();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Report code is required' },
        { status: 400 }
      );
    }

    // Validate code format (8 characters, alphanumeric)
    if (!/^[A-Z0-9]{8}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report code format' },
        { status: 400 }
      );
    }

    const filePath = path.join(REPORTS_DIR, `${code}.json`);

    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const storedReport: StoredReport = JSON.parse(fileContent);

      // Check if report has expired
      const now = new Date();
      const expiresAt = new Date(storedReport.expiresAt);
      
      if (now > expiresAt) {
        // Remove expired report
        await fs.unlink(filePath);
        return NextResponse.json(
          { success: false, error: 'Report has expired' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        report: storedReport,
        message: 'Report retrieved successfully'
      });

    } catch (fileError) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error retrieving report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve report' },
      { status: 500 }
    );
  }
}

// DELETE endpoint for cleanup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'cleanup') {
      // Clean up expired reports
      const files = await fs.readdir(REPORTS_DIR);
      const now = new Date();
      let cleanedCount = 0;

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(REPORTS_DIR, file);
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const report: StoredReport = JSON.parse(content);
            
            if (now > new Date(report.expiresAt)) {
              await fs.unlink(filePath);
              cleanedCount++;
            }
          } catch (err) {
            // Remove corrupted files
            await fs.unlink(filePath);
            cleanedCount++;
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Cleaned up ${cleanedCount} expired reports`
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}