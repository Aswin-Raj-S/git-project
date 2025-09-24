'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';

const chartData = [
  { epoch: '1', accuracy: 82.5, loss: 0.51 },
  { epoch: '2', accuracy: 85.1, loss: 0.45 },
  { epoch: '3', accuracy: 87.3, loss: 0.38 },
  { epoch: '4', accuracy: 88.9, loss: 0.32 },
  { epoch: '5', accuracy: 90.2, loss: 0.28 },
  { epoch: '6', accuracy: 91.5, loss: 0.25 },
];

const chartConfig = {
  accuracy: {
    label: 'Accuracy',
    color: 'hsl(var(--primary))',
  },
  loss: {
    label: 'Loss',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export function BaselineCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center gap-3">
          <BarChart2 className="w-6 h-6 text-primary" />
          <CardTitle>Performance Baseline</CardTitle>
        </div>
        <CardDescription>Model accuracy and loss on the CIFAR-10 test dataset.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="epoch"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `Epoch ${value}`}
            />
            <YAxis yAxisId="left" stroke="hsl(var(--primary))" />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="accuracy"
              type="monotone"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={true}
              yAxisId="left"
              name="Accuracy"
            />
            <Line
              dataKey="loss"
              type="monotone"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              dot={true}
              yAxisId="right"
              name="Loss"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
