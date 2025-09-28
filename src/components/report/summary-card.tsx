'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Shield, ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAnalysis } from '@/contexts/AnalysisContext';

export function SummaryCard() {
  const { analysisResult } = useAnalysis();
  
  if (!analysisResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Overall Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No analysis data available. Please upload and analyze a model first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { riskScore, fileName, timestamp } = analysisResult;
  const getRiskDetails = (score: number) => {
    if (score >= 70) {
      return {
        level: 'Critical Risk',
        color: 'text-red-600',
        bgColor: 'bg-red-600/10',
        borderColor: 'border-red-600/20',
        Icon: ShieldX,
        description: 'Critical security threats detected. Do not use this model in production. Contains malicious code, dangerous patterns, or severe vulnerabilities that could compromise your system.',
      };
    }
    if (score >= 50) {
      return {
        level: 'High Risk',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        Icon: ShieldX,
        description: 'Significant security risks found. Model contains suspicious patterns or potentially dangerous code. Use only in isolated environments with extreme caution.',
      };
    }
    if (score >= 30) {
      return {
        level: 'Medium Risk',
        levelColor: 'text-amber-500',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        Icon: Shield,
        description: 'Moderate security concerns identified. Some risk factors present that require additional validation and monitoring before production use.',
      };
    }
    if (score >= 15) {
      return {
        level: 'Low Risk',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        Icon: Shield,
        description: 'Minor security concerns detected. Generally safe but follow standard security practices and monitor for unusual behavior.',
      };
    }
    return {
      level: 'Minimal Risk',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      Icon: ShieldCheck,
      description: 'Model appears secure with no significant threats detected. Safe for production use with standard security practices.',
    };
  };

  const riskDetails = getRiskDetails(riskScore);

  return (
    <Card className={cn('border-2', riskDetails.borderColor)}>
      <CardHeader>
        <CardTitle className="text-xl">Overall Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className={cn(
                'relative w-32 h-32 rounded-full flex items-center justify-center',
                riskDetails.bgColor
              )}
            >
              <div
                className={cn(
                  'absolute inset-0 rounded-full border-4',
                  riskDetails.borderColor
                )}
              ></div>
              <span className={cn('text-5xl font-bold', riskDetails.color)}>{riskScore}</span>
            </div>
            <h3 className={cn('text-2xl font-semibold mt-4', riskDetails.color)}>
              {riskDetails.level}
            </h3>
          </div>
          <div className="md:col-span-2 space-y-4">
            <p className="text-base text-muted-foreground">{riskDetails.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model:</span>
                <span className="font-medium">{fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Analyzed:</span>
                <span className="font-medium">{new Date(timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Malware Status:</span>
                <span className={`font-medium ${
                  analysisResult.malwareScan.status === 'clean' ? 'text-green-500' :
                  analysisResult.malwareScan.status === 'infected' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  {analysisResult.malwareScan.status.charAt(0).toUpperCase() + analysisResult.malwareScan.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
