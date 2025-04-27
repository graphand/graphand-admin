"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useTranslation } from "@/lib/translation";
import client from "@/lib/graphand-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMe } from "@/hooks/use-me";
import { useEmailStore } from "@/store/email-store";

export function UserDropdown() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoading } = useMe();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const clearEmail = useEmailStore((state) => state.clearEmail);

  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true);

      // Call the client-side logout
      await client.get("auth").logout();

      // Also call the server-side logout endpoint
      await fetch("/auth/logout", { method: "POST" });

      // Clear user email from the store
      clearEmail();

      // Redirect to login page
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLogoutLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isLoading ? (
          <DropdownMenuLabel>{t("loading")}</DropdownMenuLabel>
        ) : user ? (
          <>
            <DropdownMenuLabel className="text-right">
              {user.getFullname()}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer justify-end">
                {t("profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/organizations/join"
                className="cursor-pointer justify-end"
              >
                {t("join_organization")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLogoutLoading}
              className="cursor-pointer justify-end"
            >
              {isLogoutLoading ? t("signing_out") : t("logout")}
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuLabel>{t("not_logged_in")}</DropdownMenuLabel>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
