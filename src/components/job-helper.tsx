"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/translation";
import { formatDistanceToNow } from "date-fns";
import {
  ClockIcon,
  CalendarIcon,
  CheckCircle2Icon,
  InfoIcon,
  AlertCircleIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useInstance } from "@/hooks/use-instance";
import client from "@/lib/graphand-client";
import { JobStatus } from "@graphand/core";
import { JobStatusPill } from "./jobs/job-status-pill";
import { JobTypePill } from "./jobs/job-type-pill";
import { Badge } from "./ui/badge";
import { JobDurationTimer } from "./jobs/job-duration-timer";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

interface JobHelperProps {
  jobId?: string | null;
  className?: string;
  minimized?: boolean;
}

export function JobHelper({ jobId, className, minimized }: JobHelperProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data: job } = useInstance(client.model("jobs"), jobId);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (triggerRef.current) {
      setDropdownWidth(triggerRef.current.getBoundingClientRect().width);
    }
  }, [open]);

  if (!job)
    return (
      <Badge
        variant="outline"
        ref={triggerRef}
        className={cn(
          "text-xs p-2",
          "transition-opacity duration-200",
          className
        )}
      >
        {!minimized && <Skeleton className="h-4 w-12" />}
        {minimized ? (
          <Skeleton className="h-5 w-5 rounded-full" />
        ) : (
          <Skeleton className="h-4 w-12" />
        )}
      </Badge>
    );

  // Check if job is ended (completed or failed)
  const isJobEnded =
    job._status === JobStatus.COMPLETED || job._status === JobStatus.FAILED;

  // Get the end time for completed or failed jobs
  const endTime = isJobEnded ? job._updatedAt : undefined;

  // Determine icon based on status
  const getStatusIcon = () => {
    switch (job._status) {
      case JobStatus.COMPLETED:
        return <CheckCircle2Icon className="h-4 w-4 text-green-500" />;
      case JobStatus.FAILED:
        return <AlertCircleIcon className="h-4 w-4 text-destructive" />;
      default:
        return <InfoIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Badge
          variant="outline"
          ref={triggerRef}
          className={cn(
            "text-xs p-2",
            isJobEnded && !open
              ? "opacity-50 hover:opacity-100"
              : "opacity-100",
            "transition-opacity duration-200",
            className
          )}
        >
          {!minimized && (
            <JobTypePill type={job._type} className="border-none" />
          )}
          <JobStatusPill
            status={job._status as JobStatus}
            startedAt={job._startedAt}
            minimized={minimized}
          />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        style={{ width: `${dropdownWidth}px` }}
        className="p-0 min-w-60"
      >
        <div className="p-3 space-y-1 bg-muted/50 border-b">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div className="text-sm font-bold">
              {t(`jobTypes.${job._type}`)}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {job._id && (
              <span className="font-mono">
                #<span className="select-all">{job._id}</span>
              </span>
            )}
          </div>
        </div>

        <div className="p-3 space-y-3">
          <div className="grid grid-cols-[16px_1fr] gap-x-2 gap-y-2 items-start text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1 pt-0.5">
              {job._createdAt && (
                <div className="flex justify-between gap-x-2">
                  <span className="text-muted-foreground truncate text-xs">
                    {t("models.jobs.properties._createdAt")}:
                  </span>
                  <span className="text-right w-0 grow-1">
                    {formatDistanceToNow(new Date(job._createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}
              {job._startedAt && (
                <div className="flex justify-between gap-x-2">
                  <span className="text-muted-foreground truncate text-xs">
                    {t("models.jobs.properties._startedAt")}:
                  </span>
                  <span className="text-right w-0 grow-1">
                    {formatDistanceToNow(new Date(job._startedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}
              {job._completedAt && (
                <div className="flex justify-between gap-x-2">
                  <span className="text-muted-foreground truncate text-xs">
                    {t("models.jobs.properties._completedAt")}:
                  </span>
                  <span className="text-right w-0 grow-1">
                    {formatDistanceToNow(new Date(job._completedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}
            </div>

            <ClockIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1 pt-0.5">
              <div className="flex justify-between gap-x-2">
                <span className="text-muted-foreground truncate text-xs">
                  {t("jobs.duration")}:
                </span>
                {job._startedAt ? (
                  <JobDurationTimer
                    startTime={job._startedAt}
                    endTime={endTime}
                    formatType="detailed"
                  />
                ) : (
                  <span className="text-muted-foreground truncate text-xs">
                    {t("jobs.notStarted")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {job._result !== undefined && (
            <>
              <Separator />
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">
                  {t("jobs.result")}
                </div>
                <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-40 border">
                  {JSON.stringify(job._result, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
