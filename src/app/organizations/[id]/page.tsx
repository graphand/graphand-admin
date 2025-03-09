"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/translation";
import client from "@/lib/graphand-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ProjectItem } from "@/components/dashboard/ProjectItem";
import { CreateProjectCard } from "@/components/dashboard/CreateProjectCard";
import { Project, useDashboardProjects } from "@/hooks/use-dashboard-projects";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { UserIcon, SettingsIcon, PlusIcon, ArchiveIcon } from "lucide-react";

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("projects");
  const { ref: activeRef, inView: activeInView } = useInView();
  const { ref: archivedRef, inView: archivedInView } = useInView();

  // Fetch organization details
  const {
    data: organization,
    isLoading: isLoadingOrganization,
    isError: isErrorOrganization,
    error: organizationError,
  } = useQuery({
    queryKey: ["organization", id],
    queryFn: async () => {
      const org = await client.model("organizations").get(id as string);
      return org;
    },
  });

  // Query for active projects
  const {
    data: activeData,
    fetchNextPage: fetchNextActivePage,
    hasNextPage: hasNextActivePage,
    isFetchingNextPage: isFetchingNextActivePage,
    isLoading: isLoadingActive,
    isError: isErrorActive,
  } = useDashboardProjects(id as string, false);

  // Query for archived projects
  const {
    data: archivedData,
    fetchNextPage: fetchNextArchivedPage,
    hasNextPage: hasNextArchivedPage,
    isFetchingNextPage: isFetchingNextArchivedPage,
    isLoading: isLoadingArchived,
    isError: isErrorArchived,
  } = useDashboardProjects(id as string, true);

  // Load more projects when the load more sentinel comes into view
  useEffect(() => {
    if (
      activeInView &&
      hasNextActivePage &&
      !isFetchingNextActivePage &&
      activeTab === "projects"
    ) {
      fetchNextActivePage();
    }
  }, [
    activeInView,
    hasNextActivePage,
    isFetchingNextActivePage,
    fetchNextActivePage,
    activeTab,
  ]);

  // Load more archived projects when the load more sentinel comes into view
  useEffect(() => {
    if (
      archivedInView &&
      hasNextArchivedPage &&
      !isFetchingNextArchivedPage &&
      activeTab === "archived-projects"
    ) {
      fetchNextArchivedPage();
    }
  }, [
    archivedInView,
    hasNextArchivedPage,
    isFetchingNextArchivedPage,
    fetchNextArchivedPage,
    activeTab,
  ]);

  // Show loading state
  if (isLoadingOrganization) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-52 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (isErrorOrganization) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <p className="text-destructive">
            {organizationError instanceof Error
              ? organizationError.message
              : t("errorLoadingOrganization")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{organization?.name}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="projects">{t("projects")}</TabsTrigger>
          <TabsTrigger value="archived-projects">
            {t("archivedProjects")}
          </TabsTrigger>
          <TabsTrigger value="members">
            <UserIcon className="h-4 w-4 mr-2" />
            {t("members")}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="h-4 w-4 mr-2" />
            {t("settings")}
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          {isLoadingActive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-52 w-full rounded-md" />
              ))}
            </div>
          )}

          {isErrorActive && (
            <div className="py-6 text-center text-destructive">
              {t("errorLoadingProjects")}
            </div>
          )}

          {!isLoadingActive && activeData?.pages[0]?.items?.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-muted-foreground mb-4">
                {t("noProjectsFound")}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projects/create?organizationId=${id}`}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {t("createProject")}
                </Link>
              </Button>
            </div>
          )}

          {!isLoadingActive &&
            activeData &&
            activeData.pages[0]?.items?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Projects */}
                {activeData.pages.map((page) =>
                  page.items.map((project) => (
                    <ProjectItem
                      key={project._id}
                      project={project as unknown as Project}
                      isArchived={false}
                    />
                  ))
                )}

                {/* Create project card */}
                <CreateProjectCard organizationId={id as string} />
              </div>
            )}

          {/* Load more sentinel */}
          {(hasNextActivePage || isFetchingNextActivePage) && (
            <div
              ref={activeRef}
              className="h-20 flex items-center justify-center mt-4"
            >
              {isFetchingNextActivePage && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-52 rounded-md" />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Archived Projects Tab */}
        <TabsContent value="archived-projects" className="space-y-4">
          {isLoadingArchived && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-52 w-full rounded-md" />
              ))}
            </div>
          )}

          {isErrorArchived && (
            <div className="py-6 text-center text-destructive">
              {t("errorLoadingProjects")}
            </div>
          )}

          {!isLoadingArchived &&
            archivedData?.pages[0]?.items?.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-muted-foreground mb-4">
                  {t("noArchivedProjectsFound")}
                </p>
              </div>
            )}

          {!isLoadingArchived &&
            archivedData &&
            archivedData.pages[0]?.items?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Projects */}
                {archivedData.pages.map((page) =>
                  page.items.map((project) => (
                    <ProjectItem
                      key={project._id}
                      project={project as unknown as Project}
                      isArchived={true}
                    />
                  ))
                )}
              </div>
            )}

          {/* Load more sentinel */}
          {(hasNextArchivedPage || isFetchingNextArchivedPage) && (
            <div
              ref={archivedRef}
              className="h-20 flex items-center justify-center mt-4"
            >
              {isFetchingNextArchivedPage && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-52 rounded-md" />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("organizationMembers")}</CardTitle>
              <CardDescription>
                {t("manageOrganizationMembers")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("membersTabComingSoon")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("organizationSettings")}</CardTitle>
              <CardDescription>
                {t("manageOrganizationSettings")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("settingsTabComingSoon")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
