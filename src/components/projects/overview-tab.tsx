import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/translation";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstance } from "@/hooks/use-instance";
import client from "@/lib/graphand-client";

interface OverviewTabProps {
  projectId: string;
}

export function OverviewTab({ projectId }: OverviewTabProps) {
  const { t } = useTranslation();
  const { data: project, isLoading } = useInstance(
    client.model("projects"),
    projectId
  );
  console.log(project);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("projectOverview")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <p>{t("projectOverviewPlaceholder")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
