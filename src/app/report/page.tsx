import { Header } from '@/components/layout/header';
import { ArchitectureCard } from '@/components/report/architecture-card';
import { BaselineCard } from '@/components/report/baseline-card';
import { ExplainabilityCard } from '@/components/report/explainability-card';
import { MalwareScanCard } from '@/components/report/malware-scan-card';
import { RobustnessCard } from '@/components/report/robustness-card';
import { SummaryCard } from '@/components/report/summary-card';
import { TrojanCard } from '@/components/report/trojan-card';
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-4">
            <SummaryCard riskScore={82} />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <ArchitectureCard />
            <RobustnessCard />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <MalwareScanCard />
            <div className="lg:col-span-3">
              <BaselineCard />
            </div>
          </div>

          <div className="lg:col-span-4">
            <ExplainabilityCard />
          </div>

          <div className="lg:col-span-4">
            <TrojanCard />
          </div>
        </div>
      </main>
    </div>
  );
}
