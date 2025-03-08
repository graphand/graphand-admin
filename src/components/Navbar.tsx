"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import client from "@/lib/graphand-client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ModelInstance } from "@graphand/core";
import Organization from "@/lib/models/Organization";
import { LanguageSelector } from "./LanguageSelector";
import { useLocaleStore } from "@/store/useLocaleStore";
import { useTranslation } from "@/lib/translations";

export function Navbar() {
  const { selectedOrganization, setSelectedOrganization } =
    useOrganizationStore();
  const { locale } = useLocaleStore();
  const { t } = useTranslation(locale);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch organizations
  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations-select"],
    queryFn: async () => {
      const list = await client
        .model("organizations")
        .getList({ pageSize: 50, page: 1 });
      return list;
    },
  });

  // Handle organization selection
  const handleOrganizationChange = (orgId: string) => {
    if (orgId === "none") {
      setSelectedOrganization(null);
      return;
    }

    const selectedOrg =
      (organizations?.find((org) => org._id === orgId) as ModelInstance<
        typeof Organization
      >) || null;
    setSelectedOrganization(selectedOrg);
  };

  // Ensure we're rendering on client-side only for zustand hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <NavbarSkeleton />;
  }

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {t("dashboard")}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/organizations" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {t("organizations")}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/profile" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {t("profile")}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <LanguageSelector />

          <div className="w-[220px]">
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={String(selectedOrganization?._id || "none")}
                onValueChange={handleOrganizationChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectOrganization")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("noOrganization")}</SelectItem>
                  {organizations &&
                    organizations.map((org) => (
                      <SelectItem key={org._id} value={String(org._id)}>
                        {org.name || org._id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavbarSkeleton() {
  return (
    <div className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-[80px]" />
          <Skeleton className="h-10 w-[220px]" />
        </div>
      </div>
    </div>
  );
}
