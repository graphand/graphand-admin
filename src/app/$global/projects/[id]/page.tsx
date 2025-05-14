"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/translation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/page-title";
import {
  LayoutDashboardIcon,
  CreditCardIcon,
  ClockIcon,
  DatabaseIcon,
  ShieldIcon,
  SettingsIcon,
  ArchiveIcon,
} from "lucide-react";

// Import tab components
import { OverviewTab } from "@/components/projects/overview-tab";
import { SubscriptionTab } from "@/components/projects/subscription-tab";
import { JobsTab } from "@/components/projects/jobs-tab";
import { SnapshotsTab } from "@/components/projects/snapshots-tab";
import { SecurityTab } from "@/components/projects/security-tab";
import { SettingsTab } from "@/components/projects/settings-tab";
import { ModelInstance } from "@graphand/core";
import Organization from "@/lib/models/Organization";
import { useInstance } from "@/hooks/use-instance";
import client from "@/lib/graphand-client";
import { JobHelper } from "@/components/job-helper";

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
  } = useInstance(client.model("projects"), {
    filter: id,
    populate: ["_job"],
  });

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

  const projectBadges = (
    <>
      {isArchived && (
        <Badge
          variant="outline"
          className="bg-muted/50 flex items-center gap-1"
        >
          <ArchiveIcon className="h-3 w-3" />
          {t("archivedProjectBadge")}
        </Badge>
      )}
    </>
  );

  const rightElement = <JobHelper jobId={project?._job?._id} />;

  return (
    <div className="container mx-auto py-10 relative">
      <PageTitle
        title={project?.name}
        isLoading={isLoadingProject || isLoadingOrganization}
        badges={projectBadges}
        rightElement={rightElement}
        className="-mt-6"
        backLink={{
          href: `/organizations/${project?.organization?._id}`,
          label: organization?.name || "",
        }}
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="w-full overflow-x-auto">
          <TabsList className="gap-1">
            <TabsTrigger value="overview">
              <LayoutDashboardIcon className="h-4 w-4" />
              {t("projects.navigation.overview")}
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CreditCardIcon className="h-4 w-4" />
              {t("projects.navigation.subscription")}
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <ClockIcon className="h-4 w-4" />
              {t("projects.navigation.jobs")}
            </TabsTrigger>
            <TabsTrigger value="snapshots">
              <DatabaseIcon className="h-4 w-4" />
              {t("projects.navigation.snapshots")}
            </TabsTrigger>
            <TabsTrigger value="security">
              <ShieldIcon className="h-4 w-4" />
              {t("projects.navigation.security")}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <SettingsIcon className="h-4 w-4" />
              {t("projects.navigation.settings")}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <OverviewTab projectId={id as string} />
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
