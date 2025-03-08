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
import { FolderIcon, ExternalLinkIcon, ArchiveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/lib/translation";

interface ProjectItemProps {
  project: Project;
  isArchived?: boolean;
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
      <CardFooter className="p-2 bg-muted/20 flex justify-end border-t">
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link href={`/projects/${project._id}`}>
            <ExternalLinkIcon className="h-3 w-3 mr-1" />
            {t("viewProject")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
