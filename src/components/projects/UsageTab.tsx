import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/translation";

interface UsageTabProps {
  projectId: string;
}

export function UsageTab({ projectId }: UsageTabProps) {
  const { t } = useTranslation();
  console.log(projectId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("projectUsage")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("projectUsagePlaceholder")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
