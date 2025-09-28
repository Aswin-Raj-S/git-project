'use client';

import { useEffect, useState } from 'react';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Header } from '@/components/layout/header';
import { ArchitectureCard } from '@/components/report/architecture-card';
import { MalwareScanCard } from '@/components/report/malware-scan-card';
import { SummaryCard } from '@/components/report/summary-card';
import { TrustCard } from '@/components/report/trust-card';
import ModelDetailsCard from '@/components/report/model-details-card';
import { ReportLoadingSkeleton } from '@/components/report/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ReportPageClient() {
  const { analysisResult, isAnalyzing } = useAnalysis();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Show loading skeleton for 5 seconds on Audit Report page
    const timer = setTimeout(() => {
      setShowSkeleton(false);
      setCountdown(0);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, []);

  const isLoading = showSkeleton || isAnalyzing;

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-slate-900">
              Audit Report
            </h1>
            <p className="text-slate-600 text-lg">Comprehensive AI Model Security Analysis</p>
          </div>
          <Button disabled={isLoading} className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {(isAnalyzing || showSkeleton) && (
              <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/50 shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <AlertDescription className="ml-3 text-slate-700 font-medium">
                  🔍 {isAnalyzing ? 'Analyzing model security...' : `Generating comprehensive audit report...${countdown > 0 ? ` (${countdown}s remaining)` : ''}`} Please wait.
                </AlertDescription>
              </Alert>
            )}
            <ReportLoadingSkeleton />
          </div>
        ) : !analysisResult ? (
          <Alert>
            <AlertDescription>
              No analysis data available. Please upload and analyze a model first.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-8">
            <SummaryCard />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <ArchitectureCard />
                <MalwareScanCard />
              </div>
              <div className="space-y-8">
                <TrustCard />
                <ModelDetailsCard />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}