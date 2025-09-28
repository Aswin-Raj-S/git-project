'use client';

import { useMemo } from 'react';
import { Shield, ShieldCheck, ShieldAlert, ShieldX, FileCheck, User, Award, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAnalysis } from '@/contexts/AnalysisContext';
import { calculateTrustScores, getRiskLevel, TrustIndicator } from '@/lib/risk-scoring';

export function TrustCard() {
  const { analysisResult } = useAnalysis();

  // Calculate dynamic trust scores based on actual analysis data
  const { trustIndicators, overallTrustScore } = useMemo(() => {
    if (!analysisResult) {
      // Return default values when no analysis is available
      return {
        trustIndicators: [
          {
            category: 'File Integrity',
            score: 0,
            status: 'unknown' as const,
            details: ['No analysis data available'],
            riskFactors: []
          },
          {
            category: 'Model Provenance',
            score: 0,
            status: 'unknown' as const,
            details: ['No analysis data available'],
            riskFactors: []
          },
          {
            category: 'Security Profile',
            score: 0,
            status: 'unknown' as const,
            details: ['No analysis data available'],
            riskFactors: []
          },
          {
            category: 'Community Trust',
            score: 0,
            status: 'unknown' as const,
            details: ['No analysis data available'],
            riskFactors: []
          }
        ],
        overallTrustScore: 0
      };
    }

    const { indicators, overall } = calculateTrustScores(analysisResult);
    return {
      trustIndicators: indicators,
      overallTrustScore: overall
    };
  }, [analysisResult]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high': return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case 'medium': return <Shield className="h-5 w-5 text-yellow-500" />;
      case 'low': return <ShieldAlert className="h-5 w-5 text-orange-500" />;
      case 'critical': return <ShieldX className="h-5 w-5 text-red-500" />;
      default: return <ShieldX className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-green-800 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-800 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-orange-800 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-800 bg-red-50 border-red-200';
      default: return 'text-gray-800 bg-gray-50 border-gray-200';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const riskLevel = getRiskLevel(overallTrustScore);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Award className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle className="text-xl">Model Trust & Provenance</CardTitle>
            <CardDescription>
              Comprehensive analysis of model trustworthiness and origin verification
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Trust Score */}
        <div className={`p-4 rounded-lg border ${riskLevel.bgColor}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg text-black">Overall Risk Assessment</h3>
            <Badge variant="outline" className={riskLevel.color}>
              {riskLevel.level}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${riskLevel.progressColor}`}
                  style={{ width: `${overallTrustScore}%` }}
                ></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-black">
              {overallTrustScore}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {riskLevel.description}
          </p>
        </div>

        {/* Trust Categories */}
        <div className="grid md:grid-cols-2 gap-4">
          {trustIndicators.map((indicator, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getStatusColor(indicator.status)}`}>
              <div className="flex items-center space-x-2 mb-3">
                {getStatusIcon(indicator.status)}
                <h4 className="font-semibold">{indicator.category}</h4>
                <Badge variant="outline" className="ml-auto text-black font-semibold">
                  {indicator.score}%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(indicator.status)}`}
                  style={{ width: `${indicator.score}%` }}
                ></div>
              </div>
              
              {/* Analysis Details */}
              <ul className="text-sm space-y-1 mb-3">
                {indicator.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              {/* Risk Factors */}
              {indicator.riskFactors && indicator.riskFactors.length > 0 && (
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs font-medium text-red-700 mb-1">Risk Factors:</p>
                  <ul className="text-xs space-y-1">
                    {indicator.riskFactors.slice(0, 3).map((risk, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-red-600">
                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dynamic Security Recommendations */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Recommendations</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {analysisResult?.malwareScan.recommendations ? (
                analysisResult.malwareScan.recommendations.map((rec, idx) => (
                  <p key={idx}>• <strong>{rec}</strong></p>
                ))
              ) : (
                <>
                  <p>• <strong>Verify model source:</strong> Contact the model provider for authenticity confirmation</p>
                  <p>• <strong>Run additional scans:</strong> Consider using multiple security tools for validation</p>
                  <p>• <strong>Sandbox testing:</strong> Test model behavior in isolated environment before production use</p>
                  <p>• <strong>Monitor usage:</strong> Implement logging and monitoring for anomalous model behavior</p>
                </>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {/* Dynamic Verification Badges */}
        <div className="flex flex-wrap gap-2">
          {analysisResult ? (
            <>
              <Badge 
                variant="outline" 
                className={analysisResult.metadata.format === 'safetensors' ? 'text-green-700' : 'text-red-700'}
              >
                <FileCheck className="h-3 w-3 mr-1" />
                {analysisResult.metadata.format === 'safetensors' ? 'SafeTensors Format' : `${analysisResult.metadata.format} Format`}
              </Badge>
              
              <Badge 
                variant="outline" 
                className={analysisResult.malwareScan.status === 'clean' ? 'text-green-700' : 'text-red-700'}
              >
                <Shield className="h-3 w-3 mr-1" />
                {analysisResult.malwareScan.status === 'clean' ? 'No Threats' : `${analysisResult.malwareScan.threatsFound} Threats`}
              </Badge>
              
              <Badge 
                variant="outline" 
                className={analysisResult.metadata.author ? 'text-blue-700' : 'text-yellow-700'}
              >
                <User className="h-3 w-3 mr-1" />
                {analysisResult.metadata.author || 'Unknown Author'}
              </Badge>

              {analysisResult.architecture.suspicious && (
                <Badge variant="outline" className="text-red-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Suspicious Architecture
                </Badge>
              )}

              {analysisResult.malwareScan.severityLevel === 'critical' && (
                <Badge variant="outline" className="text-red-700">
                  <ShieldX className="h-3 w-3 mr-1" />
                  Critical Risk
                </Badge>
              )}
            </>
          ) : (
            <Badge variant="outline" className="text-gray-700">
              <AlertTriangle className="h-3 w-3 mr-1" />
              No Analysis Data
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}