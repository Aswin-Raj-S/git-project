'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AnalysisResult {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  malwareScan: {
    status: 'clean' | 'infected' | 'suspicious';
    threatsFound: number;
    scanTime: string;
    details: string[];
  };
  architecture: {
    modelType: string;
    parameters: number;
    layers: string[];
    suspicious: boolean;
    securityIssues: string[];
  };
  riskScore: number;
  timestamp: string;
}

interface AnalysisContextType {
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <AnalysisContext.Provider value={{
      analysisResult,
      setAnalysisResult,
      isAnalyzing,
      setIsAnalyzing
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}