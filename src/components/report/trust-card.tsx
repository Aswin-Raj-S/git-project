'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Shield, ShieldCheck, ShieldAlert, ShieldX, Clock, FileCheck, Globe, User, Award, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TrustIndicator {
  category: string;
  score: number;
  status: 'high' | 'medium' | 'low' | 'unknown';
  details: string[];
}

export function TrustCard() {
  const [trustIndicators] = useState<TrustIndicator[]>([
    {
      category: "File Integrity",
      score: 85,
      status: 'high',
      details: [
        "SafeTensors format verified",
        "No embedded executables detected", 
        "File size matches expected parameters",
        "Consistent tensor dimensions"
      ]
    },
    {
      category: "Model Provenance",
      score: 45,
      status: 'medium',
      details: [
        "No digital signature found",
        "Unknown training provenance",
        "Missing author metadata",
        "No version control history"
      ]
    },
    {
      category: "Security Profile", 
      score: 72,
      status: 'medium',
      details: [
        "Standard model architecture",
        "No suspicious layer configurations",
        "Reasonable parameter count",
        "No obvious backdoor signatures"
      ]
    },
    {
      category: "Community Trust",
      score: 30,
      status: 'low',
      details: [
        "No community reviews available",
        "Unknown download statistics", 
        "No official endorsements",
        "Limited usage verification"
      ]
    }
  ]);

  const overallTrustScore = Math.round(
    trustIndicators.reduce((acc, indicator) => acc + indicator.score, 0) / trustIndicators.length
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high': return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case 'medium': return <Shield className="h-5 w-5 text-yellow-500" />;
      case 'low': return <ShieldAlert className="h-5 w-5 text-orange-500" />;
      default: return <ShieldX className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrustLevel = (score: number) => {
    if (score >= 80) return { level: 'High Trust', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 60) return { level: 'Medium Trust', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (score >= 40) return { level: 'Low Trust', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { level: 'Very Low Trust', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const trustLevel = getTrustLevel(overallTrustScore);

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
        <div className={`p-4 rounded-lg border ${trustLevel.bgColor}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Overall Trust Score</h3>
            <Badge variant="outline" className={trustLevel.color}>
              {trustLevel.level}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Progress value={overallTrustScore} className="h-3" />
            </div>
            <span className={`text-2xl font-bold ${trustLevel.color}`}>
              {overallTrustScore}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Based on file integrity, provenance verification, security analysis, and community trust indicators
          </p>
        </div>

        {/* Trust Categories */}
        <div className="grid md:grid-cols-2 gap-4">
          {trustIndicators.map((indicator, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getStatusColor(indicator.status)}`}>
              <div className="flex items-center space-x-2 mb-3">
                {getStatusIcon(indicator.status)}
                <h4 className="font-semibold">{indicator.category}</h4>
                <Badge variant="outline" className="ml-auto">
                  {indicator.score}%
                </Badge>
              </div>
              <Progress value={indicator.score} className="h-2 mb-3" />
              <ul className="text-sm space-y-1">
                {indicator.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Security Recommendations */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Recommendations</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              <p>• <strong>Verify model source:</strong> Contact the model provider for authenticity confirmation</p>
              <p>• <strong>Run additional scans:</strong> Consider using multiple security tools for validation</p>
              <p>• <strong>Sandbox testing:</strong> Test model behavior in isolated environment before production use</p>
              <p>• <strong>Monitor usage:</strong> Implement logging and monitoring for anomalous model behavior</p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Verification Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-green-600">
            <FileCheck className="h-3 w-3 mr-1" />
            SafeTensors Format
          </Badge>
          <Badge variant="outline" className="text-blue-600">
            <Shield className="h-3 w-3 mr-1" />
            No Executables
          </Badge>
          <Badge variant="outline" className="text-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Unverified Origin
          </Badge>
          <Badge variant="outline" className="text-gray-600">
            <User className="h-3 w-3 mr-1" />
            Unknown Author
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}