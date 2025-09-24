'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Loader2, FileWarning, CheckCircle } from 'lucide-react';
import { generateBackdoorTriggers, GenerateBackdoorTriggersOutput } from '@/ai/flows/generate-backdoor-triggers';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export function TrojanCard() {
  const [result, setResult] = useState<GenerateBackdoorTriggersOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const input = {
        modelDescription: 'Custom CNN for CIFAR-10, potentially compromised.',
        neuronActivationProfile: JSON.stringify({
          suspiciousNeurons: [128, 256, 512],
          triggerCorrelation: 'High activation on inputs with small, high-contrast patches in the top-right corner.',
        }),
      };
      const response = await generateBackdoorTriggers(input);
      setResult(response);
    } catch (e) {
      setError('Failed to synthesize trigger. The AI model may be offline.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center gap-3">
          <Target className="w-6 h-6 text-primary" />
          <CardTitle>Backdoor Trigger Synthesis</CardTitle>
        </div>
        <CardDescription>
          Attempt to reconstruct hidden triggers by optimizing an input pattern to activate suspicious neurons.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Synthesizing Trigger...
              </>
            ) : (
              'Synthesize Potential Trigger'
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

        <div className="bg-muted rounded-lg p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4">Analyzing neuron activations and generating triggers...</p>
            </div>
          )}
          {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="mt-4 font-semibold">No active analysis.</p>
                <p className="text-sm">Click "Synthesize" to search for hidden backdoors.</p>
            </div>
          )}
          {!loading && result && (
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center space-y-2">
                <h3 className="font-semibold">Candidate Trigger</h3>
                <div className="w-32 h-32 relative rounded-lg overflow-hidden border-2 border-dashed">
                  <Image
                    src={result.triggerImage}
                    alt="Generated backdoor trigger"
                    fill
                    className="object-cover"
                  />
                </div>
                 <p className="text-xs text-muted-foreground text-center">A small patch designed to cause misclassification.</p>
              </div>
              <div className="md:col-span-2">
                <Alert variant="destructive">
                    <FileWarning className="h-4 w-4" />
                    <AlertTitle>Misclassification Report</AlertTitle>
                    <AlertDescription>
                        <p className="font-code text-sm">{result.misclassificationReport}</p>
                    </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
