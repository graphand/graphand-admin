import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import Link from "next/link";
import { PlusIcon, Loader2 } from "lucide-react";
import {
  ProjectItem,
  ProjectItemSkeleton,
} from "@/components/dashboard/project-item";
import { CreateProjectCard } from "@/components/dashboard/create-project-card";
import { Project, useDashboardProjects } from "@/hooks/use-dashboard-projects";
import { useTranslation } from "@/lib/translation";

interface ProjectsTabProps {
  organizationId: string;
}

export function ProjectsTab({ organizationId }: ProjectsTabProps) {
  const { t } = useTranslation();
  const { ref: activeRef, inView: activeInView } = useInView();

  // Query for active projects
  const {
    data: activeData,
    fetchNextPage: fetchNextActivePage,
    hasNextPage: hasNextActivePage,
    isFetchingNextPage: isFetchingNextActivePage,
    isLoading: isLoadingActive,
    isError: isErrorActive,
  } = useDashboardProjects(organizationId, false);

  // Load more projects when the load more sentinel comes into view
  useEffect(() => {
    if (activeInView && hasNextActivePage && !isFetchingNextActivePage) {
      fetchNextActivePage();
    }
  }, [
    activeInView,
    hasNextActivePage,
    isFetchingNextActivePage,
    fetchNextActivePage,
  ]);

  return (
    <div className="space-y-4">
      {isLoadingActive && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectItemSkeleton key={index} />
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
          <p className="text-muted-foreground mb-4">{t("noProjectsFound")}</p>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/create?organizationId=${organizationId}`}>
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
            <CreateProjectCard organizationId={organizationId} />
          </div>
        )}

      {/* Load more sentinel */}
      {(hasNextActivePage || isFetchingNextActivePage) && (
        <div
          ref={activeRef}
          className="h-20 flex items-center justify-center mt-4"
        >
          {isFetchingNextActivePage && (
            <div className="flex justify-center w-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
