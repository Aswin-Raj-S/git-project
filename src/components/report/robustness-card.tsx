import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export function RobustnessCard() {
  const robustnessScore = 68; // Example score
  const accuracyDrop = 23.5; // Example drop

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-primary" />
          <CardTitle>Adversarial Robustness</CardTitle>
        </div>
        <CardDescription>Resilience against FGSM attacks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center items-baseline gap-2">
          <span className="text-6xl font-bold text-amber-500">{robustnessScore}</span>
          <span className="text-2xl text-muted-foreground">/ 100</span>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          The model's accuracy dropped by <strong className="text-foreground">{accuracyDrop}%</strong> under adversarial conditions, indicating a moderate vulnerability.
        </p>
      </CardContent>
    </Card>
  );
}
