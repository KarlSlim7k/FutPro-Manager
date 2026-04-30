import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FormSectionCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function FormSectionCard({
  title,
  children,
  className,
  contentClassName,
}: FormSectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
}
