"use client";

import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/translation";
import {
  Organization,
  useDashboardOrganizations,
} from "@/hooks/use-dashboard-organizations";
import {
  OrganizationSection,
  OrganizationSectionSkeleton,
} from "@/components/dashboard/OrganizationSection";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { PlusIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import EmailVerificationAlert from "@/components/EmailVerificationAlert";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDashboardOrganizations();

  // Load more organizations when the load more sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const skeleton = (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("dashboard")}</h1>
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/organizations">
              <EyeIcon className="h-4 w-4" />
              {t("viewAll")}
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/organizations/create">
              <PlusIcon className="h-4 w-4" />
              {t("createOrganization")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, orgIndex) => (
          <OrganizationSectionSkeleton key={orgIndex} />
        ))}
      </div>
    </div>
  );

  // Render loading state
  if (isLoading && !data) {
    return skeleton;
  }

  // Render error state
  if (isError) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">{t("dashboard")}</h1>
        <div className="bg-destructive/10 p-4 rounded-md border border-destructive">
          <p className="text-destructive">
            {error instanceof Error
              ? error.message
              : t("errorLoadingDashboard")}
          </p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (data?.pages[0]?.items?.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <EmailVerificationAlert />

        <h1 className="text-3xl font-bold mb-6">{t("dashboard")}</h1>
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            {t("noOrganizationsFound")}
          </p>
          <Button variant="default" asChild>
            <Link href="/organizations/create">
              <PlusIcon className="h-4 w-4 mr-2" />
              {t("createOrganization")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate total organizations count from the first page data
  const totalOrganizations = data?.pages[0]?.totalCount || 0;

  return (
    <div className="container mx-auto py-10 relative">
      <EmailVerificationAlert />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
          {totalOrganizations > 0 && (
            <p className="text-muted-foreground mt-1">
              {totalOrganizations}{" "}
              {totalOrganizations === 1
                ? t("organization")
                : t("organizations")}
            </p>
          )}
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/organizations">
              <EyeIcon className="h-4 w-4" />
              {t("viewAll")}
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/organizations/create">
              <PlusIcon className="h-4 w-4" />
              {t("createOrganization")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Organizations with their projects */}
      <div className="space-y-6">
        {data?.pages.map((page) =>
          page.items.map((organization) => (
            <OrganizationSection
              key={organization._id}
              organization={organization as unknown as Organization}
            />
          ))
        )}

        {/* Load more sentinel */}
        {(hasNextPage || isFetchingNextPage) && (
          <div ref={ref} className="h-20">
            {isFetchingNextPage && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <div className="sticky top-0 bg-background py-4 z-10 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-32" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-9 w-36 rounded-md" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="border rounded-lg overflow-hidden h-52 flex flex-col"
                      >
                        <div className="p-4 pb-2 pt-6">
                          <div className="flex flex-row items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Skeleton className="h-4 w-4 rounded-sm" />
                                <Skeleton className="h-6 w-24" />
                              </div>
                              <Skeleton className="h-4 w-20 mt-1" />
                            </div>
                            <Skeleton className="h-5 w-12 rounded-full" />
                          </div>
                        </div>
                        <div className="p-4 pt-0 flex-grow">
                          <Skeleton className="h-4 w-32 mt-4" />
                        </div>
                        <div className="p-2 bg-muted/20 flex justify-end border-t">
                          <Skeleton className="h-8 w-24 rounded-md" />
                        </div>
                      </div>
                    ))}

                    {/* Create Project Card */}
                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl h-52 flex items-center justify-center">
                      <div className="flex flex-col items-center justify-center px-6 py-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Skeleton className="h-6 w-6 rounded-sm" />
                        </div>
                        <Skeleton className="h-6 w-28 mb-2" />
                        <Skeleton className="h-4 w-36 mb-4" />
                        <Skeleton className="h-8 w-32 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
