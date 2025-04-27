"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/translation";
import client from "@/lib/graphand-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon, SettingsIcon, ArchiveIcon, FolderIcon } from "lucide-react";
import { PageTitle } from "@/components/page-title";

// Import tab components
import { ProjectsTab } from "@/components/organizations/projects-tab";
import { ArchivedProjectsTab } from "@/components/organizations/archived-projects-tab";
import { MembersTab } from "@/components/organizations/members-tab";
import { SettingsTab } from "@/components/organizations/settings-tab";

export default function OrganizationsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("projects");

  // Effect to read the hash from URL when component mounts
  useEffect(() => {
    // Get the hash without the # symbol, defaulting to "projects" if not present
    const hash = window.location.hash.slice(1);
    if (
      hash &&
      ["projects", "archived-projects", "members", "settings"].includes(hash)
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

  // Fetch organization details
  const {
    data: organization,
    isLoading: isLoadingOrganization,
    isError: isErrorOrganization,
    error: organizationError,
  } = useQuery({
    queryKey: ["organization", id],
    queryFn: async () => {
      return await client.model("organizations").get(id as string);
    },
  });

  if (isErrorOrganization) {
    if (organizationError) {
      console.log(organizationError);
    }

    return null;
  }

  return (
    <div className="container mx-auto py-10 relative">
      <PageTitle title={organization?.name} isLoading={isLoadingOrganization} />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-6 gap-1">
          <TabsTrigger value="projects">
            <FolderIcon className="h-4 w-4" />
            {t("projects")}
          </TabsTrigger>
          <TabsTrigger value="archived-projects">
            <ArchiveIcon className="h-4 w-4" />
            {t("archivedProjects")}
          </TabsTrigger>
          <TabsTrigger value="members">
            <UserIcon className="h-4 w-4" />
            {t("members")}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="h-4 w-4" />
            {t("settings")}
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <ProjectsTab organizationId={id as string} />
        </TabsContent>

        {/* Archived Projects Tab */}
        <TabsContent value="archived-projects">
          <ArchivedProjectsTab organizationId={id as string} />
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          {organization && (
            <MembersTab
              organization={organization}
              isLoading={isLoadingOrganization}
            />
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
