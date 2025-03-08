"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import client from "@/lib/graphand-client";
import { useLocaleStore } from "@/store/useLocaleStore";
import { useTranslation } from "@/lib/translations";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { locale } = useLocaleStore();
  const { t } = useTranslation(locale);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Call the client-side logout
      await client.get("auth").logout();

      // Also call the server-side logout endpoint
      await fetch("/auth/logout", { method: "POST" });

      // Redirect to login page
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Button onClick={handleLogout} disabled={isLoading} variant="default">
      {isLoading ? "Signing out..." : t("logout")}
    </Button>
  );
}
