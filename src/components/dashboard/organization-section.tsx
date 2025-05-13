import { useEffect } from "react";
import { useDashboardProjects } from "@/hooks/use-dashboard-projects";
import { ProjectItem, ProjectItemSkeleton } from "./project-item";
import { CreateProjectCard } from "./create-project-card";
import { Button } from "@/components/ui/button";
import { PlusIcon, EyeIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "@/lib/translation";
import Link from "next/link";
import { ModelInstance } from "@graphand/core";
import Organization from "@/lib/models/Organization";
import { useRouter } from "next/navigation";

interface OrganizationSectionProps {
  organization: ModelInstance<typeof Organization>;
}

export function OrganizationSectionSkeleton() {
  return (
    <div>
      <div className="sticky top-0 py-4 z-10 border-b bg-background px-1 -mx-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              <Skeleton className="h-6 w-32" />
            </h2>
            <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
            <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
          </div>
          <Skeleton className="h-8 w-40 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <ProjectItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function OrganizationSection({
  organization,
}: OrganizationSectionProps) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();
  const router = useRouter();

  // Query for active projects only
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useDashboardProjects(organization._id, false);

  // Load more projects when the load more sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Calculate total projects count
  const totalProjects = data?.pages[0]?.totalCount || 0;
  const totalMembers = organization._accounts?.cached?.count || 0;

  return (
    <div>
      <div className="sticky top-0 py-4 z-10 border-b bg-background px-1 -mx-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 truncate">
            <h2 className="text-xl font-semibold truncate">
              {organization.name}
            </h2>

            {isLoading ? (
              <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
            ) : (
              <span
                className="text-muted-foreground text-sm bg-muted px-2 py-0.5 rounded-full select-none cursor-pointer hidden sm:block"
                onClick={() => {
                  router.push(`/organizations/${organization._id}#projects`);
                }}
              >
                {totalProjects}{" "}
                {totalProjects === 1
                  ? t("labels.project")
                  : t("labels.projects")}
              </span>
            )}

            {isLoading ? (
              <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
            ) : (
              <span
                className="text-muted-foreground text-sm bg-muted px-2 py-0.5 rounded-full select-none cursor-pointer hidden sm:block"
                onClick={() => {
                  router.push(`/organizations/${organization._id}#members`);
                }}
              >
                {totalMembers}{" "}
                {totalMembers === 1 ? t("labels.member") : t("labels.members")}
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/organizations/${organization._id}`}>
              <EyeIcon className="h-4 w-4 mr-2" />
              {t("viewOrganization")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {/* Render empty state for active projects */}
        {!isLoading && data?.pages[0]?.items?.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-4">{t("noProjectsFound")}</p>
            <Button variant="default" size="sm" asChild>
              <Link
                href={`/projects/create?organizationId=${organization._id}`}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {t("createProject")}
              </Link>
            </Button>
          </div>
        )}

        {/* Render error state for active projects */}
        {isError && (
          <div className="py-6 text-center text-destructive">
            {t("errorLoadingProjects")}
          </div>
        )}

        {/* Loading state for active projects */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProjectItemSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Active projects grid */}
        {!isLoading && data && data.pages[0]?.items?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Projects */}
            {data.pages.map((page) =>
              page.items.map((project) => (
                <ProjectItem
                  key={project._id}
                  project={project}
                  isArchived={false}
                />
              ))
            )}

            {/* Create project card */}
            <CreateProjectCard organizationId={organization._id} />
          </div>
        )}

        {/* Load more sentinel */}
        {(hasNextPage || isFetchingNextPage) && (
          <div ref={ref} className="h-20 flex items-center justify-center mt-4">
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
