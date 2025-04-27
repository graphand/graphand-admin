import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/translation";

interface SubscriptionTabProps {
  projectId: string;
}

export function SubscriptionTab({ projectId }: SubscriptionTabProps) {
  const { t } = useTranslation();
  console.log(projectId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("projectSubscription")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("projectSubscriptionPlaceholder")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
