import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Blocks } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ArchitectureCard() {
  const architectureDetails = [
    { name: 'Total Parameters', value: '11,177,538' },
    { name: 'Trainable Parameters', value: '11,177,538' },
    { name: 'Total Layers', value: '23' },
    { name: 'Conv2D Layers', value: '10' },
    { name: 'Linear Layers', value: '3' },
    { name: 'Input Shape', value: '[3, 32, 32]' },
    { name: 'Output Classes', value: '10' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Blocks className="w-6 h-6 text-primary" />
        <CardTitle>Model Architecture</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          A summary of the model's structure and parameter counts.
        </p>
        <Table>
          <TableBody>
            {architectureDetails.map((item) => (
              <TableRow key={item.name}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right font-code text-muted-foreground">{item.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
