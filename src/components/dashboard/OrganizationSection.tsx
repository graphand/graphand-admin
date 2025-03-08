import { useEffect, useState } from "react";
import { Organization } from "@/hooks/use-dashboard-organizations";
import { Project, useDashboardProjects } from "@/hooks/use-dashboard-projects";
import { ProjectItem } from "./ProjectItem";
import { CreateProjectCard } from "./CreateProjectCard";
import { Button } from "@/components/ui/button";
import { PlusIcon, ArchiveIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "@/lib/translation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrganizationSectionProps {
  organization: Organization;
}

export function OrganizationSection({
  organization,
}: OrganizationSectionProps) {
  const { t } = useTranslation();
  const [showArchived, setShowArchived] = useState(false);
  const { ref: activeRef, inView: activeInView } = useInView();
  const { ref: archivedRef, inView: archivedInView } = useInView();

  // Query for active projects
  const {
    data: activeData,
    fetchNextPage: fetchNextActivePage,
    hasNextPage: hasNextActivePage,
    isFetchingNextPage: isFetchingNextActivePage,
    isLoading: isLoadingActive,
    isError: isErrorActive,
  } = useDashboardProjects(organization._id, false);

  // Query for archived projects
  const {
    data: archivedData,
    fetchNextPage: fetchNextArchivedPage,
    hasNextPage: hasNextArchivedPage,
    isFetchingNextPage: isFetchingNextArchivedPage,
    isLoading: isLoadingArchived,
    isError: isErrorArchived,
  } = useDashboardProjects(organization._id, true);

  // Load more projects when the load more sentinel comes into view
  useEffect(() => {
    if (
      activeInView &&
      hasNextActivePage &&
      !isFetchingNextActivePage &&
      !showArchived
    ) {
      fetchNextActivePage();
    }
  }, [
    activeInView,
    hasNextActivePage,
    isFetchingNextActivePage,
    fetchNextActivePage,
    showArchived,
  ]);

  // Load more archived projects when the load more sentinel comes into view
  useEffect(() => {
    if (
      archivedInView &&
      hasNextArchivedPage &&
      !isFetchingNextArchivedPage &&
      showArchived
    ) {
      fetchNextArchivedPage();
    }
  }, [
    archivedInView,
    hasNextArchivedPage,
    isFetchingNextArchivedPage,
    fetchNextArchivedPage,
    showArchived,
  ]);

  // Get the current data based on the tab
  const currentData = showArchived ? archivedData : activeData;
  const isLoading = showArchived ? isLoadingArchived : isLoadingActive;
  const isError = showArchived ? isErrorArchived : isErrorActive;
  const hasNextPage = showArchived ? hasNextArchivedPage : hasNextActivePage;
  const isFetchingNextPage = showArchived
    ? isFetchingNextArchivedPage
    : isFetchingNextActivePage;
  const loadMoreRef = showArchived ? archivedRef : activeRef;

  return (
    <div className="mb-10">
      <div className="sticky top-0 bg-background py-4 z-10 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{organization.name}</h2>
          <Tabs
            defaultValue="active"
            onValueChange={(value: string) =>
              setShowArchived(value === "archived")
            }
          >
            <TabsList>
              <TabsTrigger value="active">
                {t("showActiveProjects")}
              </TabsTrigger>
              <TabsTrigger value="archived">
                {t("showArchivedProjects")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="mt-4">
        {/* Render empty state */}
        {!isLoading && currentData?.pages[0]?.items?.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-4">
              {showArchived
                ? t("noArchivedProjectsFound")
                : t("noProjectsFound")}
            </p>
            {!showArchived && (
              <Button variant="outline" size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                {t("createProject")}
              </Button>
            )}
          </div>
        )}

        {/* Render error state */}
        {isError && (
          <div className="py-6 text-center text-destructive">
            {t("errorLoadingProjects")}
          </div>
        )}

        {/* Projects grid */}
        {currentData && currentData.pages[0]?.items?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Projects */}
            {currentData.pages.map((page) =>
              page.items.map((project) => (
                <ProjectItem
                  key={project._id}
                  project={project as unknown as Project}
                  isArchived={showArchived}
                />
              ))
            )}

            {/* Loading skeletons */}
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-52 w-full rounded-md" />
              ))}

            {/* Create project card - only show for active projects */}
            {!showArchived && (
              <CreateProjectCard organizationId={organization._id} />
            )}
          </div>
        )}

        {/* Load more sentinel */}
        {(hasNextPage || isFetchingNextPage) && (
          <div
            ref={loadMoreRef}
            className="h-20 flex items-center justify-center mt-4"
          >
            {isFetchingNextPage && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-52 rounded-md" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
