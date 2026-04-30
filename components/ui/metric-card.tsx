import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  description,
  className,
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <p className={cn("text-3xl font-bold text-emerald-700")}>{value}</p>
      </CardContent>
    </Card>
  );
}
