"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface ChartData {
  name: string; // Region name
  total: number; // Customer count
}

interface CustomersPerRegionChartProps {
  data: ChartData[];
}

export function CustomersPerRegionChart({
  data,
}: CustomersPerRegionChartProps) {
  return (
    <Card className="h-[418px] flex flex-col">
      {" "}
      {/* Match height of RecentCollectionsChart */}
      <CardHeader>
        <CardTitle>Customers per Region</CardTitle>
    
      </CardHeader>
      <CardContent className="flex-grow pl-2">
      
        {/* Use flex-grow */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ right: 30 }}>
        
            {/* Vertical layout is good for lists */}
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />{" "}
            {/* Vertical grid lines only */}
            <XAxis
              type="number"
              stroke="#888888"
              fontSize={12}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={80} // Adjust width for longer region names
            />
            <Tooltip
              cursor={{ fill: "rgba(100, 100, 100, 0.1)" }}
              formatter={(value: number) => [
                value.toLocaleString(),
                "Customers",
              ]}
            />
            <Bar
              dataKey="total"
              fill="#8884d8"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
