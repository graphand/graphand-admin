"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/lib/translations";
import { useLocaleStore } from "@/store/useLocaleStore";

interface ProfileContentProps {
  user: any;
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const { locale } = useLocaleStore();
  const { t } = useTranslation(locale);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("profile")}</h1>
        <Button asChild variant="outline">
          <Link href="/">{t("backToDashboard")}</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("userInformation")}</CardTitle>
            <CardDescription>{t("personalInformation")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("email")}
                </h3>
                <p className="text-base">
                  {user?._email || t("noEmailProvided")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("username")}
                </h3>
                <p className="text-base">
                  {user?._id || t("noUsernameProvided")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("userId")}
                </h3>
                <p className="text-base font-mono">
                  {user?._id || t("unknown")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("accountCreated")}
                </h3>
                <p className="text-base">
                  {user?._createdAt
                    ? new Date(user._createdAt).toLocaleDateString(
                        locale === "fr" ? "fr-FR" : "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : t("unknown")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("accountSettings")}</CardTitle>
            <CardDescription>{t("manageAccountPreferences")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t("accountSettingsDescription")}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/profile/edit">{t("editProfile")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
