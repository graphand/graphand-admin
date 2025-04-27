import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/translation";

interface JobsTabProps {
  projectId: string;
}

export function JobsTab({ projectId }: JobsTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("projectJobs")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("projectJobsPlaceholder")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
