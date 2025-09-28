'use client';

import { Header } from '@/components/layout/header';
import { UploadForm } from '@/components/upload-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileScan, ShieldCheck, ShieldOff } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <ShieldOff className="w-8 h-8 text-primary" />,
      title: 'Malware Scan',
      description: 'Comprehensive scan for viruses, trojans, ransomware, and malicious code patterns.',
    },
    {
      icon: <FileScan className="w-8 h-8 text-primary" />,
      title: 'Architecture Analysis', 
      description: 'Deep inspection of model structure, parameters, and security vulnerabilities.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: 'Risk Assessment',
      description: 'Comprehensive security scoring based on real analysis results.',
    },
  ];  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
              Uncover Hidden Risks in Your AI.
            </h1>
            <p className="text-lg text-muted-foreground">
              Cogniguard is a comprehensive security auditing tool that stress-tests your AI models, identifies vulnerabilities, and delivers actionable insights to help you build safer, more reliable AI.
            </p>
            <UploadForm />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
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
