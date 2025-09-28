'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Blocks, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAnalysis } from '@/contexts/AnalysisContext';

export function ArchitectureCard() {
  const { analysisResult } = useAnalysis();
  
  if (!analysisResult) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <Blocks className="w-6 h-6 text-primary" />
          <CardTitle>Model Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No architecture data available. Please upload and analyze a model first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { architecture, fileName, fileSize } = analysisResult;
  
  const architectureDetails = [
    { name: 'Model Type', value: architecture.modelType },
    { name: 'File Name', value: fileName },
    { name: 'File Size', value: `${(fileSize / (1024 * 1024)).toFixed(2)} MB` },
    { name: 'Total Parameters', value: architecture.parameters.toLocaleString() },
    { name: 'Total Layers', value: architecture.layers.length.toString() },
    { name: 'Security Issues', value: architecture.securityIssues?.length || 0 },
    { name: 'Suspicious', value: architecture.suspicious ? 'Yes' : 'No' },
  ];

  return (
    <Card className="bg-white shadow-lg border-slate-200 overflow-hidden">
      <CardHeader className="pb-6 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-primary/10 shadow-sm">
            <Blocks className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Model Architecture</CardTitle>
            <p className="text-slate-600 mt-1">
              Detailed analysis of model structure and components
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {architecture.suspicious && (
          <Alert className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50/50 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800 font-medium">
              <strong>Warning:</strong> Suspicious architecture detected. This model may contain risky components.
            </AlertDescription>
          </Alert>
        )}
        
        {architecture.securityIssues && architecture.securityIssues.length > 0 && (
          <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50/50 shadow-sm" variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription>
              <strong>Security Issues Found:</strong>
              <ul className="list-disc list-inside mt-3 space-y-1">
                {architecture.securityIssues.map((issue, index) => (
                  <li key={index} className="text-sm">{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h3 className="font-semibold text-lg text-slate-900 mb-4">Architecture Details</h3>
          <div className="space-y-4">
            {architectureDetails.map((item) => (
              <div key={item.name} className="flex justify-between items-center py-2 border-b border-slate-200/50 last:border-b-0">
                <span className="font-medium text-slate-700">{item.name}</span>
                <span className={`font-semibold text-right ${
                  item.name === 'Suspicious' && item.value === 'Yes' 
                    ? 'text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm' 
                    : item.name === 'Security Issues' && parseInt(item.value.toString()) > 0
                    ? 'text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm'
                    : 'text-slate-900'
                }`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {architecture.layers.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Detected Layers/Components:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              {architecture.layers.slice(0, 10).map((layer, index) => (
                <div key={index} className="font-mono bg-muted px-2 py-1 rounded">
                  {layer}
                </div>
              ))}
              {architecture.layers.length > 10 && (
                <div className="text-xs text-muted-foreground">
                  ... and {architecture.layers.length - 10} more layers
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
