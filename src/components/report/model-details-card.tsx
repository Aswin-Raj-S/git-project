'use client';

import { useAnalysis } from '@/contexts/AnalysisContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ModelDetailsCard() {
  const { analysisResult } = useAnalysis();

  if (!analysisResult) {
    return null;
  }

  const { metadata, architecture, fileName, fileSize, fileHash } = analysisResult;

  return (
    <Card className="bg-white shadow-lg border-slate-200 overflow-hidden">
      <CardHeader className="pb-6 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-primary/10 shadow-sm">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Model Details & Metadata</CardTitle>
            <p className="text-slate-600 mt-1">Comprehensive model information and technical specifications</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Basic File Information */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h4 className="font-semibold text-lg text-slate-900 mb-4">File Information</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
              <span className="font-medium text-slate-700">Filename</span>
              <span className="font-mono text-sm bg-slate-100 px-3 py-1 rounded-lg text-slate-800 break-all">{fileName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
              <span className="font-medium text-slate-700">Size</span>
              <span className="font-semibold text-slate-900">{metadata.modelSize}</span>
            </div>
            <div className="py-2">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-slate-700">SHA256</span>
              </div>
              <div className="font-mono text-xs bg-slate-100 p-3 rounded-lg text-slate-800 break-all">{fileHash}</div>
            </div>
          </div>
        </div>

        {/* Format & Framework */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h4 className="font-semibold text-lg text-slate-900 mb-4">Format & Framework</h4>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary font-medium">{metadata.format}</Badge>
            <Badge variant="outline" className="px-3 py-1 border-slate-300 text-slate-700 font-medium">{metadata.framework}</Badge>
            {metadata.version && <Badge variant="outline" className="px-3 py-1 border-slate-300 text-slate-700 font-medium">v{metadata.version}</Badge>}
          </div>
          {metadata.dependencies && metadata.dependencies.length > 0 && (
            <div>
              <span className="text-muted-foreground text-sm">Dependencies:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {metadata.dependencies.map((dep, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Model Architecture */}
        <div>
          <h4 className="font-semibold mb-2">Architecture</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <p>{architecture.modelType}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Parameters:</span>
              <p>{architecture.parameters.toLocaleString()}</p>
            </div>
          </div>
          {architecture.layers && architecture.layers.length > 0 && (
            <div className="mt-2">
              <span className="text-muted-foreground text-sm">Layer Types:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {architecture.layers.slice(0, 10).map((layer, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {layer}
                  </Badge>
                ))}
                {architecture.layers.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{architecture.layers.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Training Information */}
        {metadata.trainingInfo && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Training Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {metadata.trainingInfo.dataset && (
                  <div>
                    <span className="text-muted-foreground">Dataset:</span>
                    <p>{metadata.trainingInfo.dataset}</p>
                  </div>
                )}
                {metadata.trainingInfo.epochs && (
                  <div>
                    <span className="text-muted-foreground">Epochs:</span>
                    <p>{metadata.trainingInfo.epochs}</p>
                  </div>
                )}
                {metadata.trainingInfo.accuracy && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Accuracy:</span>
                    <p>{(metadata.trainingInfo.accuracy * 100).toFixed(2)}%</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Author & Description */}
        {(metadata.author || metadata.description) && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Model Information</h4>
              {metadata.author && (
                <div className="mb-2">
                  <span className="text-muted-foreground text-sm">Author:</span>
                  <p>{metadata.author}</p>
                </div>
              )}
              {metadata.description && (
                <div>
                  <span className="text-muted-foreground text-sm">Description:</span>
                  <p className="text-sm">{metadata.description}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Security Issues */}
        {architecture.securityIssues && architecture.securityIssues.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2 text-amber-600">Security Concerns</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {architecture.securityIssues.map((issue, idx) => (
                  <li key={idx} className="text-amber-700">{issue}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}