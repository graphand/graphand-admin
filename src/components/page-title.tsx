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
  rightElement?: ReactNode;
  className?: string;
}

export function PageTitleSkeleton({
  backLink,
  badges,
  rightElement,
  className,
}: PageTitleProps) {
  return (
    <div className={cn("mb-6", className)}>
      {backLink && (
        <div className="flex items-center mb-1 h-5">
          <Skeleton className="h-5 w-40" />
        </div>
      )}
      <div className="flex items-center justify-between h-10">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Skeleton className="h-9 w-60" />
          {badges && <Skeleton className="h-5 w-20" />}
        </h1>
        {rightElement && <div className="ml-auto">{rightElement}</div>}
      </div>
    </div>
  );
}

export function PageTitle({
  title,
  isLoading = false,
  backLink,
  badges,
  rightElement,
  className,
}: PageTitleProps) {
  if (isLoading) {
    return (
      <PageTitleSkeleton
        backLink={backLink}
        badges={badges}
        rightElement={rightElement}
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
      <div className="flex items-center justify-between h-10">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          {title}
          {badges}
        </h1>
        {rightElement && <div className="ml-auto">{rightElement}</div>}
      </div>
    </div>
  );
}
