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
  const getStatusIcon = (status: JobStatus | string | null | undefined) => {
    if (!status) return null;

    switch (status) {
      case JobStatus.COMPLETED:
      case "completed":
        return <CheckCircle2Icon className="h-4 w-4" />;
      case JobStatus.FAILED:
      case "failed":
        return <XCircleIcon className="h-4 w-4" />;
      case JobStatus.ACTIVE:
      case "active":
      case "running":
        return <Loader2Icon className="h-4 w-4 animate-spin" />;
      case JobStatus.QUEUED:
      case "queued":
        return <TimerIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const isActive = status === JobStatus.ACTIVE;

  if (minimized) {
    return (
      <div className="flex items-center text-sm h-5 min-w-5 justify-center">
        {getStatusIcon(status)}
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
      {!minimized && (status || "unknown")}
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
