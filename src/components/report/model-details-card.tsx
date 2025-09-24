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
    <Card>
      <CardHeader>
        <CardTitle>Model Details & Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic File Information */}
        <div>
          <h4 className="font-semibold mb-2">File Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Filename:</span>
              <p className="font-mono break-all">{fileName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Size:</span>
              <p>{metadata.modelSize}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">SHA256:</span>
              <p className="font-mono text-xs break-all">{fileHash}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Format & Framework */}
        <div>
          <h4 className="font-semibold mb-2">Format & Framework</h4>
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary">{metadata.format}</Badge>
            <Badge variant="outline">{metadata.framework}</Badge>
            {metadata.version && <Badge variant="outline">v{metadata.version}</Badge>}
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