"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/translation";

interface JobTypePillProps {
  type: string | null | undefined;
  className?: string;
}

export function JobTypePill({ type, className }: JobTypePillProps) {
  const { t } = useTranslation();

  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      {t(`jobTypes.${type}`)}
    </Badge>
  );
}
