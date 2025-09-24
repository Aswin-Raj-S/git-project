import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { AnalysisProvider } from '@/contexts/AnalysisContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'ModelSherlock',
  description: 'AI Model Security Auditing Tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col">
        <AnalysisProvider>
          {children}
          <Toaster />
        </AnalysisProvider>
      </body>
    </html>
  );
}
