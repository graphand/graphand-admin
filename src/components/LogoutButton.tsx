"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import client from "@/lib/graphand-client";
import { useTranslation } from "@/lib/translation";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

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

  return (
    <Button onClick={handleLogout} disabled={isLoading} variant="default">
      {isLoading ? "Signing out..." : t("logout")}
    </Button>
  );
}
