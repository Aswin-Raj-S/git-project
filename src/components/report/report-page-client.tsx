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
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
            Audit Report
          </h1>
          <Button disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {(isAnalyzing || showSkeleton) && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription className="ml-2">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <SummaryCard />
            </div>

            <div className="flex flex-col gap-6">
              <ArchitectureCard />
              <ModelDetailsCard />
            </div>

            <div className="flex flex-col gap-6">
              <MalwareScanCard />
            </div>

            <div className="lg:col-span-2">
              <TrustCard />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}