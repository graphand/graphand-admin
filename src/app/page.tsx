"use client";

import { useEffect } from "react";
import LogoutButton from "@/components/LogoutButton";
import { Skeleton } from "@/components/ui/skeleton";
import client from "@/lib/graphand-client";
import { useTranslation } from "@/lib/translation";
import {
  Organization,
  useDashboardOrganizations,
} from "@/hooks/use-dashboard-organizations";
import { OrganizationSection } from "@/components/dashboard/OrganizationSection";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

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

  // Render loading state
  if (isLoading && !data) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">{t("dashboard")}</h1>
        <div className="space-y-10">
          {Array.from({ length: 2 }).map((_, orgIndex) => (
            <div key={orgIndex} className="mb-10">
              <Skeleton className="h-8 w-64 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-52 rounded-md" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t("dashboard")}</h1>

      {/* Organizations with their projects */}
      <div className="space-y-6">
        {data?.pages.map((page, pageIndex) => (
          <div key={pageIndex}>
            {page.items.map((organization) => (
              <OrganizationSection
                key={organization._id}
                organization={organization as unknown as Organization}
              />
            ))}
          </div>
        ))}

        {/* Load more sentinel */}
        {(hasNextPage || isFetchingNextPage) && (
          <div ref={ref} className="h-20">
            {isFetchingNextPage && (
              <div className="space-y-10">
                <div className="mb-10">
                  <Skeleton className="h-8 w-64 mb-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton key={index} className="h-52 rounded-md" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create new organization button */}
        <div className="flex justify-center pt-6 pb-10 border-t mt-6">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/organizations/create">
              <PlusIcon className="h-4 w-4" />
              {t("createOrganization")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
