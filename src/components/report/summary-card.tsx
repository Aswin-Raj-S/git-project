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
    <Card className="overflow-hidden bg-white shadow-lg border-slate-200">
      <CardHeader className={cn("pb-4 bg-gradient-to-r", riskDetails.bgColor, "border-b border-slate-100")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-xl shadow-sm", riskDetails.bgColor)}>
              <riskDetails.Icon className={cn("h-8 w-8", riskDetails.color)} />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900 font-bold">Overall Risk Assessment</CardTitle>
              <p className="text-slate-600 mt-1">
                {fileName} • {new Date(timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={cn("text-4xl font-bold mb-2", riskDetails.color)}>
              {riskScore}/100
            </div>
            <div className={cn("text-sm font-semibold px-4 py-2 rounded-full shadow-sm", riskDetails.bgColor, riskDetails.color)}>
              {riskDetails.level}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-lg mb-3 text-slate-900">Risk Analysis</h3>
            <p className="text-slate-600 leading-relaxed">
              {riskDetails.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-primary mb-1">
                {analysisResult.architecture?.layers?.length || 'N/A'}
              </div>
              <div className="text-sm text-slate-600">Layers Analyzed</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-primary mb-1">
                {analysisResult.malwareScan?.threatsFound || 0}
              </div>
              <div className="text-sm text-slate-600">Threats Found</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-primary mb-1">
                {Math.round((1 - riskScore/100) * 100)}%
              </div>
              <div className="text-sm text-slate-600">Trust Score</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
