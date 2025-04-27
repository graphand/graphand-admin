import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/translation";

interface SecurityTabProps {
  projectId: string;
}

export function SecurityTab({ projectId }: SecurityTabProps) {
  const { t } = useTranslation();
  console.log(projectId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("projectSecurity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("projectSecurityPlaceholder")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
