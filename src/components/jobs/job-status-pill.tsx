"use client";

import { Badge } from "@/components/ui/badge";
import { JobStatus } from "@graphand/core";
import {
  CheckCircle2Icon,
  XCircleIcon,
  TimerIcon,
  Loader2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JobDurationTimer } from "./job-duration-timer";
import { useTranslation } from "@/lib/translation";

interface JobStatusPillProps {
  status: JobStatus | string | null | undefined;
  className?: string;
  startedAt?: Date | string | null | undefined;
  minimized?: boolean;
}

export function JobStatusPill({
  status,
  className,
  startedAt,
  minimized,
}: JobStatusPillProps) {
  const { t } = useTranslation();

  // Define badge variant based on status
  const getVariant = (status: JobStatus | string | null | undefined) => {
    if (!status) return "outline";

    switch (status) {
      case JobStatus.COMPLETED:
      case "completed":
        return "default";
      case JobStatus.FAILED:
      case "failed":
        return "destructive";
      case JobStatus.ACTIVE:
      case "active":
      case JobStatus.QUEUED:
      case "queued":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Get status icon based on job status
  const getStatusIcon = (
    status: JobStatus | string | null | undefined,
    className?: string
  ) => {
    if (!status) return null;

    switch (status) {
      case JobStatus.COMPLETED:
        return <CheckCircle2Icon className={cn("h-4 w-4", className)} />;
      case JobStatus.FAILED:
        return <XCircleIcon className={cn("h-4 w-4", className)} />;
      case JobStatus.ACTIVE:
        return (
          <Loader2Icon className={cn("h-4 w-4 animate-spin", className)} />
        );
      case JobStatus.QUEUED:
        return <TimerIcon className={cn("h-4 w-4", className)} />;
      default:
        return null;
    }
  };

  const getMinimizedIconClassName = (
    status: JobStatus | string | null | undefined
  ) => {
    switch (status) {
      case JobStatus.COMPLETED:
        return "text-green-600";
      case JobStatus.FAILED:
        return "text-red-600";
      default:
        return "text-black";
    }
  };

  const isActive = status === JobStatus.ACTIVE;

  if (minimized) {
    return (
      <div className="flex items-center text-sm h-5 min-w-5 justify-center">
        {getStatusIcon(status, getMinimizedIconClassName(status))}
        {isActive && startedAt && (
          <JobDurationTimer
            startTime={startedAt}
            formatType="compact"
            className="ml-1 text-xs"
          />
        )}
      </div>
    );
  }

  return (
    <Badge
      variant={getVariant(status)}
      className={cn("text-xs flex items-center", className)}
    >
      {getStatusIcon(status)}
      {!minimized && t(`jobStatus.${status || "unknown"}`)}
      {isActive && startedAt && (
        <JobDurationTimer
          startTime={startedAt}
          formatType="compact"
          className="ml-1"
        />
      )}
    </Badge>
  );
}
