import { useTranslation } from "@/lib/translation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function SettingsTab() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("organizationSettings")}</CardTitle>
          <CardDescription>{t("manageOrganizationSettings")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("settingsTabComingSoon")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
