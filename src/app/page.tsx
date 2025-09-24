'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { UploadForm } from '@/components/upload-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Blocks, Eye, FileScan, ShieldCheck, Target, ShieldOff } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const handleAnalyze = () => {
    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return prev;
        }
        return prev + 5;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        router.push('/report');
      }, 500);
    }, 4000);
  };

  const features = [
    {
      icon: <FileScan className="w-8 h-8 text-primary" />,
      title: 'Static Analysis',
      description: 'Inspect model structure for anomalies before execution.',
    },
    {
      icon: <ShieldOff className="w-8 h-8 text-primary" />,
      title: 'Malware Scan',
      description: 'Scan the model file for known viruses, trojans, and ransomware.',
    },
    {
      icon: <BarChart className="w-8 h-8 text-primary" />,
      title: 'Performance Baseline',
      description: 'Measure clean accuracy and loss to establish normal behavior.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: 'Adversarial Robustness',
      description: 'Test the model’s ability to withstand adversarial attacks like FGSM.',
    },
    {
      icon: <Eye className="w-8 h-8 text-primary" />,
      title: 'Explainability Audit',
      description: 'Use Grad-CAM to visualize decision focus and ensure interpretability.',
    },
    {
      icon: <Blocks className="w-8 h-8 text-primary" />,
      title: 'Neuron Analysis',
      description: 'Monitor neuron activity to identify dormant or suspicious activations.',
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: 'Backdoor Detection',
      description: 'Synthesize and identify potential hidden backdoor triggers in your model.',
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
              Uncover Hidden Risks in Your AI.
            </h1>
            <p className="text-lg text-muted-foreground">
              ModelSherlock is a comprehensive security auditing tool thatStress-tests your AI models, identifies vulnerabilities, and delivers actionable insights to help you build safer, more reliable AI.
            </p>
            <UploadForm onAnalyze={handleAnalyze} loading={loading} progress={progress} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.slice(0, 4).map((feature, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
