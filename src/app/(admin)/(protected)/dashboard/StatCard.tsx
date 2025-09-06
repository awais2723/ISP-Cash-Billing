import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  change?: string; // e.g., "+5.2%" or "-1.0%"
}

export function StatCard({ title, value, icon: Icon, description, change }: StatCardProps) {
  const isPositive = change && change.startsWith('+');
  const isNegative = change && change.startsWith('-');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          {description && <p>{description}</p>}
          {change && (
            <span className={clsx(
              'font-semibold',
              isPositive && 'text-green-600',
              isNegative && 'text-red-600'
            )}>
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}