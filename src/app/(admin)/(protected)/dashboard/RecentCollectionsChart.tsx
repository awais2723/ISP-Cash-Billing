'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartData {
  name: string;
  total: number;
}

interface RecentCollectionsChartProps {
    data: ChartData[];
}

export function RecentCollectionsChart({ data }: RecentCollectionsChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Collections (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `PKR ${value / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(100, 100, 100, 0.1)' }}
              formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Collections']}
            />
            <Bar dataKey="total" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}