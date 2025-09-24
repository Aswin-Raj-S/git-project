import { Header } from '@/components/layout/header';
import { ArchitectureCard } from '@/components/report/architecture-card';
import { MalwareScanCard } from '@/components/report/malware-scan-card';
import { SummaryCard } from '@/components/report/summary-card';
import { TrojanCard } from '@/components/report/trojan-card';
import { TrustCard } from '@/components/report/trust-card';
import ModelDetailsCard from '@/components/report/model-details-card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function ReportPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
            Audit Report
          </h1>
          <Button>
            <Download />
            Download PDF
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <SummaryCard />
          </div>

          <div className="flex flex-col gap-6">
            <ArchitectureCard />
            <ModelDetailsCard />
          </div>

          <div className="flex flex-col gap-6">
            <MalwareScanCard />
          </div>

          <div className="lg:col-span-2">
            <TrojanCard />
          </div>
          
          <div className="lg:col-span-2">
            <TrustCard />
          </div>
        </div>
      </main>
    </div>
  );
}
