import { Project } from "@/hooks/use-dashboard-projects";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  FolderIcon,
  ExternalLinkIcon,
  ArchiveIcon,
  EyeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/lib/translation";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectItemProps {
  project: Project;
  isArchived?: boolean;
}

export function ProjectItemSkeleton() {
  return (
    <div
      data-slot="card"
      className="bg-card text-card-foreground rounded-xl shadow-sm hover:bg-secondary/5 transition-colors border overflow-hidden h-full flex flex-col py-0 gap-2"
    >
      <div
        data-slot="card-header"
        className="flex flex-col gap-1.5 p-4 pb-2 pt-6"
      >
        <div className="flex flex-row items-start justify-between flex-1 overflow-hidden">
          <div className="">
            <Skeleton className="h-7 w-24" />
            <div className="h-12 mt-1">
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <Skeleton className="h-5 w-12 m-px rounded-sm" />
          </div>
        </div>
      </div>
      <div data-slot="card-content" className="p-4 pt-0 flex-grow">
        <div className="flex flex-col gap-2 mt-2">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div
        data-slot="card-footer"
        className="items-center p-2 bg-muted/20 flex justify-end border-t gap-2"
      >
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
    </div>
  );
}

export function ProjectItem({ project, isArchived = false }: ProjectItemProps) {
  const { t } = useTranslation();

  return (
    <Card className="hover:bg-secondary/5 transition-colors border overflow-hidden h-full flex flex-col py-0 gap-2">
      <CardHeader className="p-4 pb-2 pt-6">
        <div className="flex flex-row items-start justify-between flex-1 overflow-hidden">
          <div className="">
            <CardTitle className="text-lg flex items-center gap-2">
              {isArchived ? (
                <ArchiveIcon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FolderIcon className="h-4 w-4 text-primary" />
              )}
              {project.name}
            </CardTitle>
            <CardDescription className="text-sm mt-1 h-12">
              {project.slug}
            </CardDescription>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {isArchived ? (
              <Badge variant="outline" className="bg-muted/50">
                {t("archivedProjectBadge")}
              </Badge>
            ) : (
              project.version && (
                <Badge variant="outline" className="ml-2">
                  v{project.version}
                </Badge>
              )
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="flex flex-col gap-2 mt-2">
          {project._createdAt && (
            <div className="text-xs text-muted-foreground">
              Created{" "}
              {formatDistanceToNow(new Date(project._createdAt), {
                addSuffix: true,
              })}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-muted/20 flex justify-end border-t gap-2">
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link href={`/projects/${project._id}`}>
            <EyeIcon className="h-3 w-3 mr-1" />
            {t("viewProject")}
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link href="#">
            <ExternalLinkIcon className="h-3 w-3 mr-1" />
            {t("openProject")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
