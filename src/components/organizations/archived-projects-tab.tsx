import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import {
  ProjectItem,
  ProjectItemSkeleton,
} from "@/components/dashboard/project-item";
import { Project, useDashboardProjects } from "@/hooks/use-dashboard-projects";
import { useTranslation } from "@/lib/translation";
import { Loader2 } from "lucide-react";

interface ArchivedProjectsTabProps {
  organizationId: string;
}

export function ArchivedProjectsTab({
  organizationId,
}: ArchivedProjectsTabProps) {
  const { t } = useTranslation();
  const { ref: archivedRef, inView: archivedInView } = useInView();

  // Query for archived projects
  const {
    data: archivedData,
    fetchNextPage: fetchNextArchivedPage,
    hasNextPage: hasNextArchivedPage,
    isFetchingNextPage: isFetchingNextArchivedPage,
    isLoading: isLoadingArchived,
    isError: isErrorArchived,
  } = useDashboardProjects(organizationId, true);

  // Load more archived projects when the load more sentinel comes into view
  useEffect(() => {
    if (archivedInView && hasNextArchivedPage && !isFetchingNextArchivedPage) {
      fetchNextArchivedPage();
    }
  }, [
    archivedInView,
    hasNextArchivedPage,
    isFetchingNextArchivedPage,
    fetchNextArchivedPage,
  ]);

  return (
    <div className="space-y-4">
      {isLoadingArchived && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectItemSkeleton key={index} />
          ))}
        </div>
      )}

      {isErrorArchived && (
        <div className="py-6 text-center text-destructive">
          {t("errorLoadingProjects")}
        </div>
      )}

      {!isLoadingArchived && archivedData?.pages[0]?.items?.length === 0 && (
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
            <div className="flex justify-center w-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
