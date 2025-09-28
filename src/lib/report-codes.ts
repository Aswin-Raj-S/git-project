// Report code generation and management utilities

export interface StoredReport {
  code: string;
  analysisResult: any;
  timestamp: string;
  fileName: string;
}

// Generate a unique 8-character report code
export function generateReportCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Save report to localStorage with generated code
export function saveReportWithCode(analysisResult: any): string {
  const reportCode = generateReportCode();
  const storedReport: StoredReport = {
    code: reportCode,
    analysisResult,
    timestamp: new Date().toISOString(),
    fileName: analysisResult.fileName
  };
  
  try {
    // Save to localStorage
    localStorage.setItem(`cogniguard_report_${reportCode}`, JSON.stringify(storedReport));
    
    // Also maintain a list of all report codes for management
    const allCodes = getAllReportCodes();
    allCodes.push(reportCode);
    localStorage.setItem('cogniguard_all_codes', JSON.stringify(allCodes));
    
    return reportCode;
  } catch (error) {
    console.error('Error saving report:', error);
    throw new Error('Failed to save report');
  }
}

// Retrieve report by code
export function getReportByCode(code: string): StoredReport | null {
  try {
    const storedData = localStorage.getItem(`cogniguard_report_${code.toUpperCase()}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving report:', error);
    return null;
  }
}

// Get all report codes
export function getAllReportCodes(): string[] {
  try {
    const codesData = localStorage.getItem('cogniguard_all_codes');
    return codesData ? JSON.parse(codesData) : [];
  } catch (error) {
    console.error('Error getting report codes:', error);
    return [];
  }
}

// Check if a report code exists
export function isValidReportCode(code: string): boolean {
  return getReportByCode(code) !== null;
}

// Clean up old reports (older than 30 days)
export function cleanupOldReports(): void {
  try {
    const allCodes = getAllReportCodes();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const validCodes: string[] = [];
    
    allCodes.forEach(code => {
      const report = getReportByCode(code);
      if (report && new Date(report.timestamp) > thirtyDaysAgo) {
        validCodes.push(code);
      } else {
        // Remove old report
        localStorage.removeItem(`cogniguard_report_${code}`);
      }
    });
    
    // Update the codes list
    localStorage.setItem('cogniguard_all_codes', JSON.stringify(validCodes));
  } catch (error) {
    console.error('Error cleaning up old reports:', error);
  }
}