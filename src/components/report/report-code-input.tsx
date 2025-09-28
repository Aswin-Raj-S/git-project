'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, FileText, AlertCircle } from 'lucide-react';
import { useAnalysis } from '@/contexts/AnalysisContext';

interface ReportCodeInputProps {
  onReportLoaded: () => void;
}

export function ReportCodeInput({ onReportLoaded }: ReportCodeInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAnalysisResult } = useAnalysis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter a report code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const storedReport = getReportByCode(code.trim());
      
      if (storedReport) {
        // Load the report into the analysis context
        setAnalysisResult(storedReport.analysisResult);
        onReportLoaded();
      } else {
        setError('Report code not found. Please check the code and try again.');
      }
    } catch (err) {
      setError('Error loading report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCode = (value: string) => {
    // Format as XXXX-XXXX for better readability
    const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 4) {
      return cleaned;
    }
    return cleaned.slice(0, 4) + '-' + cleaned.slice(4, 8);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setCode(formatted);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl border-slate-200">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-100">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Access Report</CardTitle>
          <p className="text-slate-600 mt-2">
            Enter your report code to view a previously generated security analysis
          </p>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="reportCode" className="text-sm font-medium text-slate-700">
                Report Code
              </label>
              <Input
                id="reportCode"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="XXXX-XXXX"
                maxLength={9}
                className="text-center text-lg font-mono tracking-wider h-12 border-slate-300 focus:border-primary focus:ring-primary"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 text-center">
                Enter the 8-character code from your report
              </p>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={isLoading || code.length < 8}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Loading Report...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Load Report
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center">
              Don't have a report code?{' '}
              <a href="/" className="text-primary hover:text-primary/80 font-medium">
                Create a new analysis
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}