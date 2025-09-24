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
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Blocks className="w-6 h-6 text-primary" />
        <CardTitle>Model Architecture</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          A summary of the model's structure and parameter counts.
        </p>
        
        {architecture.suspicious && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Suspicious architecture detected. This model may contain risky components.
            </AlertDescription>
          </Alert>
        )}
        
        {architecture.securityIssues && architecture.securityIssues.length > 0 && (
          <Alert className="mb-4" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Issues Found:</strong>
              <ul className="list-disc list-inside mt-2">
                {architecture.securityIssues.map((issue, index) => (
                  <li key={index} className="text-sm">{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <Table>
          <TableBody>
            {architectureDetails.map((item) => (
              <TableRow key={item.name}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className={`text-right font-code ${
                  item.name === 'Suspicious' && item.value === 'Yes' 
                    ? 'text-red-500 font-semibold' 
                    : item.name === 'Security Issues' && parseInt(item.value.toString()) > 0
                    ? 'text-red-500 font-semibold'
                    : 'text-muted-foreground'
                }`}>
                  {item.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
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
