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
    <div className="flex flex-col flex-1 bg-gradient-to-br from-slate-50 to-blue-50/50">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-tight text-slate-900 leading-tight">
                Uncover Hidden Risks <span className="text-primary">in Your AI</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Cogniguard is a comprehensive security auditing tool that stress-tests your AI models, identifies vulnerabilities, and delivers actionable insights to help you build safer, more reliable AI.
              </p>
            </div>
            <UploadForm />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl w-fit mb-4 shadow-sm">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-semibold text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
