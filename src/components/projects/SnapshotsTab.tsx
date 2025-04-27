import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/translation";

interface SnapshotsTabProps {
  projectId: string;
}

export function SnapshotsTab({ projectId }: SnapshotsTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("projectSnapshots")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("projectSnapshotsPlaceholder")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
