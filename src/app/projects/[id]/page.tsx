"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/translation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboardIcon,
  BarChartIcon,
  CreditCardIcon,
  ClockIcon,
  DatabaseIcon,
  ShieldIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ArchiveIcon,
} from "lucide-react";

// Import tab components
import { OverviewTab } from "@/components/projects/OverviewTab";
import { UsageTab } from "@/components/projects/UsageTab";
import { SubscriptionTab } from "@/components/projects/SubscriptionTab";
import { JobsTab } from "@/components/projects/JobsTab";
import { SnapshotsTab } from "@/components/projects/SnapshotsTab";
import { SecurityTab } from "@/components/projects/SecurityTab";
import { SettingsTab } from "@/components/projects/SettingsTab";
import { ModelInstance } from "@graphand/core";
import Organization from "@/lib/models/Organization";
import { useProject } from "@/hooks/use-project";

export default function ProjectsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  // Effect to read the hash from URL when component mounts
  useEffect(() => {
    // Get the hash without the # symbol, defaulting to "overview" if not present
    const hash = window.location.hash.slice(1);
    if (
      hash &&
      [
        "overview",
        "usage",
        "subscription",
        "jobs",
        "snapshots",
        "security",
        "settings",
      ].includes(hash)
    ) {
      setActiveTab(hash);
    }
  }, []);

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update the URL hash without causing a navigation
    window.history.replaceState(null, "", `#${value}`);
  };

  // Fetch project details
  const {
    data: project,
    isLoading: isLoadingProject,
    isError: isErrorProject,
    error: projectError,
  } = useProject(id);

  // Check if project is archived based on slug
  const isArchived = project?.slug?.startsWith("_archive");

  // Fetch organization details when project is loaded
  const { data: organization, isLoading: isLoadingOrganization } = useQuery({
    queryKey: ["organization", project?.organization?._id],
    queryFn: async () => {
      return (await project?.organization) as ModelInstance<
        typeof Organization
      >;
    },
    enabled: !!project?.organization,
  });

  if (isErrorProject) {
    if (projectError) {
      console.log(projectError);
    }

    return null;
  }

  return (
    <div className="container mx-auto py-10 relative">
      <div className="mb-6">
        {isLoadingProject || isLoadingOrganization ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-60" />
          </div>
        ) : (
          <>
            {organization && (
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Link
                  href={`/organizations/${project?.organization?._id}`}
                  className="hover:text-primary flex items-center"
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  {organization.name}
                </Link>
              </div>
            )}
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {project?.name}
              {isArchived && (
                <Badge
                  variant="outline"
                  className="bg-muted/50 flex items-center gap-1"
                >
                  <ArchiveIcon className="h-3 w-3" />
                  {t("archivedProjectBadge")}
                </Badge>
              )}
            </h1>
          </>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-6 gap-1">
          <TabsTrigger value="overview">
            <LayoutDashboardIcon className="h-4 w-4" />
            {t("overview")}
          </TabsTrigger>
          <TabsTrigger value="usage">
            <BarChartIcon className="h-4 w-4" />
            {t("usage")}
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <CreditCardIcon className="h-4 w-4" />
            {t("subscription")}
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <ClockIcon className="h-4 w-4" />
            {t("jobs")}
          </TabsTrigger>
          <TabsTrigger value="snapshots">
            <DatabaseIcon className="h-4 w-4" />
            {t("snapshots")}
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldIcon className="h-4 w-4" />
            {t("security")}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="h-4 w-4" />
            {t("settings")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <OverviewTab project={project} isLoading={isLoadingProject} />
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          <UsageTab projectId={id as string} />
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <SubscriptionTab projectId={id as string} />
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <JobsTab projectId={id as string} />
        </TabsContent>

        {/* Snapshots Tab */}
        <TabsContent value="snapshots">
          <SnapshotsTab projectId={id as string} />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <SecurityTab projectId={id as string} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <SettingsTab projectId={id as string} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
