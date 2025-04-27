import Link from "next/link";
import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageTitleProps {
  title?: string;
  isLoading?: boolean;
  backLink?: {
    href: string;
    label: string;
  };
  badges?: ReactNode;
  className?: string;
}

export function PageTitleSkeleton({
  backLink,
  badges,
  className,
}: PageTitleProps) {
  return (
    <div className={cn("mb-6", className)}>
      {backLink && (
        <div className="flex items-center mb-1 h-5">
          <Skeleton className="h-5 w-40" />
        </div>
      )}
      <div className="flex items-center gap-3 h-10">
        <Skeleton className="h-9 w-60" />
        {badges && <Skeleton className="h-5 w-20" />}
      </div>
    </div>
  );
}

export function PageTitle({
  title,
  isLoading = false,
  backLink,
  badges,
  className,
}: PageTitleProps) {
  if (isLoading) {
    return (
      <PageTitleSkeleton
        backLink={backLink}
        badges={badges}
        className={className}
      />
    );
  }

  return (
    <div className={cn("mb-6 relative", className)}>
      {backLink && (
        <div className="flex items-center text-sm text-muted-foreground mb-1 h-5">
          <Link
            href={backLink.href}
            className="hover:text-primary flex items-center"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            {backLink.label}
          </Link>
        </div>
      )}
      <h1 className="text-3xl font-bold flex items-center gap-3 h-10">
        {title}
        {badges}
      </h1>
    </div>
  );
}
