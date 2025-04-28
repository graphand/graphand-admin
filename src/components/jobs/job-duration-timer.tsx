"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface JobDurationTimerProps {
  startTime: Date | string;
  endTime?: Date | string | null;
  formatType?: "compact" | "detailed";
  className?: string;
  updateInterval?: number;
}

export function JobDurationTimer({
  startTime,
  endTime,
  formatType = "detailed",
  className,
  updateInterval = 1000,
}: JobDurationTimerProps) {
  const [duration, setDuration] = useState("--");
  const [width, setWidth] = useState(
    formatType === "compact" ? "w-6" : undefined
  );

  const formatDuration = (diffMs: number) => {
    // Convert to seconds, minutes, hours, days
    const seconds = Math.floor((diffMs / 1000) % 60);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (formatType === "compact") {
      // Compact format for status pill
      if (minutes > 0) {
        setDuration(`${minutes}m ${seconds}s`);
        setWidth("w-11");
      } else {
        setDuration(`${seconds}s`);
        setWidth("w-6");
      }
      return;
    }

    // Detailed format for job-helper dropdown
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    setDuration(parts.join(" "));
  };

  useEffect(() => {
    const updateDuration = () => {
      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : new Date();
      const diffMs = end.getTime() - start.getTime();
      formatDuration(diffMs);
    };

    // Initial update
    updateDuration();

    // Only set interval if we're using current time (no endTime provided)
    if (!endTime) {
      const interval = setInterval(updateDuration, updateInterval);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [startTime, endTime, formatType, updateInterval]);

  return (
    <span className={cn("overflow-hidden text-left", width, className)}>
      {duration}
    </span>
  );
}
