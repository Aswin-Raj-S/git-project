'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import { visualizeAIExplainabilityHeatmaps, VisualizeAIExplainabilityHeatmapsOutput } from '@/ai/flows/visualize-ai-explainability-heatmaps';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// A helper to find an image from the placeholder data
const findImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

export function ExplainabilityCard() {
  const [result, setResult] = useState<VisualizeAIExplainabilityHeatmapsOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const input = {
        modelArchitecture: 'Custom CNN for CIFAR-10',
        inputImageUri: findImage('dog-park')?.imageUrl || '',
        classOfInterest: 'Dog',
      };
      const response = await visualizeAIExplainabilityHeatmaps(input);
      setResult(response);
    } catch (e) {
      setError('Failed to generate heatmap. The AI model may be offline.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const inputImage = findImage('dog-park');

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center gap-3">
          <Eye className="w-6 h-6 text-primary" />
          <CardTitle>AI Explainability Heatmap</CardTitle>
        </div>
        <CardDescription>
          Visualize model decisions using Grad-CAM to see which parts of an image influence the prediction.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Heatmap for "Dog" Class'
            )}
          </Button>
        </div>
        
        {error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="space-y-2">
            <h3 className="font-semibold text-center">Input Image</h3>
            {inputImage && (
              <div className="aspect-video relative rounded-lg overflow-hidden border">
                <Image
                  src={inputImage.imageUrl}
                  alt={inputImage.description}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  data-ai-hint={inputImage.imageHint}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-center">Explainability Analysis</h3>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center p-4">
              {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
              {!loading && result && (
                <div className="w-full h-full grid grid-cols-2 gap-4 items-center">
                   <div className="aspect-square relative rounded-lg overflow-hidden">
                    <Image
                      src={result.heatmapUri}
                      alt="Generated Heatmap"
                      fill
                      className="object-cover"
                    />
                    <p className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs bg-black/50 text-white px-2 py-0.5 rounded">Heatmap</p>
                  </div>
                  <p className="text-sm text-muted-foreground italic">{result.explanation}</p>
                </div>
              )}
               {!loading && !result && !error && (
                <div className="text-center text-muted-foreground">
                  <p>Click "Generate" to see the model's focus.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
