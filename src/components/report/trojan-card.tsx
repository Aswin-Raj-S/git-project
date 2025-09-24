'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Loader2, FileWarning, CheckCircle, Clock } from 'lucide-react';
import { generateBackdoorTriggers, GenerateBackdoorTriggersOutput } from '@/ai/flows/generate-backdoor-triggers';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function TrojanCard() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{
        triggerImage: string;
        misclassificationReport: string;
    } | null>(null);
    const [progress, setProgress] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);

  // Progress simulation for better UX
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(0);
      setTimeElapsed(0);
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        setProgress(prev => {
          if (prev < 90) {
            // Slower progress initially, faster towards the end
            return prev + (prev < 30 ? 2 : prev < 60 ? 1 : 0.5);
          }
          return prev;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

      const handleGenerate = async () => {
        let progressInterval: NodeJS.Timeout | null = null;
        let timeInterval: NodeJS.Timeout | null = null;
        
        try {
            setLoading(true);
            setError(null);
            setResult(null);
            setProgress(0);
            setTimeElapsed(0);

            // Start progress tracking
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    const increment = Math.random() * 5 + 2; // Random increment between 2-7
                    return Math.min(prev + increment, 95); // Cap at 95% until completion
                });
            }, 800);

            // Start time tracking
            const startTime = Date.now();
            timeInterval = setInterval(() => {
                setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);

            // Call the AI flow with timeout
            const result = await generateBackdoorTriggers({
                neuronActivationProfile: JSON.stringify({
                    baseline: "Normal activation patterns across all layers",
                    perturbed: "Anomalous spikes in layers 3-5 when specific geometric patterns are present",
                    suspiciousNeurons: [127, 234, 445, 667],
                    activationThresholds: {
                        layer3: 0.85,
                        layer4: 0.92,
                        layer5: 0.78
                    }
                }),
                modelDescription: "ResNet-50 image classifier trained on CIFAR-10 dataset with 10 output classes"
            });
            
            // Complete progress
            setProgress(100);
            if (progressInterval) clearInterval(progressInterval);
            if (timeInterval) clearInterval(timeInterval);

            // Set the result after a brief delay to show completion
            setTimeout(() => {
                setResult(result);
            }, 500);
        } catch (error) {
            console.error('Error generating backdoor triggers:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            
            // Clear intervals on error
            if (progressInterval) clearInterval(progressInterval);
            if (timeInterval) clearInterval(timeInterval);
            
            if (errorMessage.includes('timeout') || errorMessage.includes('15s') || errorMessage.includes('30s')) {
                setError('⏰ AI generation timed out after 15 seconds. The analysis has been optimized for speed. Please try again.');
            } else {
                setError(`Failed to generate backdoor triggers: ${errorMessage}`);
            }
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
          <Button onClick={handleGenerate} disabled={loading} className="min-w-[200px]">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Synthesizing... {timeElapsed}s
              </>
            ) : (
              'Synthesize Potential Trigger'
            )}
          </Button>
          {loading && (
            <div className="mt-4 space-y-2">
              <Progress value={progress} className="w-full max-w-md mx-auto" />
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                Processing AI analysis... ({Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')})
              </div>
            </div>
          )}
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
              <div className="space-y-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <div>
                  <p className="font-semibold">Analyzing Neural Network</p>
                  <p className="text-sm">
                    {progress < 30 && "Examining neuron activation patterns..."}
                    {progress >= 30 && progress < 60 && "Generating trigger candidates..."}
                    {progress >= 60 && progress < 90 && "Optimizing trigger effectiveness..."}
                    {progress >= 90 && "Finalizing analysis results..."}
                  </p>
                </div>
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ⚡ This process should complete in 5-15 seconds using optimized algorithms
                </div>
              </div>
            </div>
          )}
          {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="mt-4 font-semibold">Ready for Analysis</p>
                <p className="text-sm text-center max-w-md">
                  Click "Synthesize" to use AI to generate potential backdoor triggers and test for hidden vulnerabilities in the model.
                </p>
            </div>
          )}
          {!loading && result && (
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center space-y-2">
                <h3 className="font-semibold">Candidate Trigger</h3>
                <div className="w-32 h-32 relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                  {result.triggerImage.startsWith('data:') ? (
                    <Image
                      src={result.triggerImage}
                      alt="Generated backdoor trigger"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded flex flex-col items-center justify-center text-red-700 shadow-inner">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="text-xs font-semibold mb-1 text-center">Pattern</div>
                      <div className="text-[10px] leading-tight text-center px-2 font-mono bg-white/60 rounded p-1">
                        {result.triggerImage}
                      </div>
                    </div>
                  )}
                </div>
                 <p className="text-xs text-muted-foreground text-center">A pattern designed to cause misclassification</p>
              </div>
              <div className="md:col-span-2">
                <Alert variant="destructive">
                    <FileWarning className="h-4 w-4" />
                    <AlertTitle>Misclassification Report</AlertTitle>
                    <AlertDescription>
                        <p className="font-code text-sm whitespace-pre-wrap">{result.misclassificationReport}</p>
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
