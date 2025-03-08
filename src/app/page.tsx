"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import client from "@/lib/graphand-client";
import { useTranslation } from "@/lib/translation";

export default function DashboardPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        // Check auth and get user on client-side
        const userData = await client.me();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="bg-card p-6 rounded-lg shadow">
          <Skeleton className="h-6 w-72 mb-4" />
          <Skeleton className="h-4 w-80 mb-6" />
          <div className="flex flex-col gap-4 sm:flex-row">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">{t("dashboard")}</h1>

      <div className="bg-card p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{t("welcomeDashboard")}</h2>
        <p className="text-muted-foreground mb-6">{t("loggedIn")}</p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/profile">{t("viewProfile")}</Link>
          </Button>

          <Button asChild variant="default">
            <Link href="/organizations">{t("manageOrganizations")}</Link>
          </Button>

          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
