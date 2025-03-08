"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useLocaleStore } from "@/store/useLocaleStore";
import { useTranslation } from "@/lib/translations";
import { useOrganizations } from "@/hooks/use-organizations";

export default function OrganizationPage() {
  const { locale } = useLocaleStore();
  const { t } = useTranslation(locale);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side rendering for zustand
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    organizations,
    isLoading,
    isError,
    error,
    currentPage,
    totalPages,
    totalCount,
    handlePageChange,
  } = useOrganizations();

  // Show loading skeleton
  const showLoading = isLoading || !isMounted;

  // Render loading state
  if (showLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">{t("organizations")}</h1>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-72" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">{t("organizations")}</h1>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              Failed to load organizations. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {error instanceof Error
                ? error.message
                : "Unknown error occurred"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">{t("organizations")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("yourOrganizations")}</CardTitle>
          <CardDescription>{t("viewAndManageOrganizations")}</CardDescription>
        </CardHeader>
        <CardContent>
          {organizations.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("id")}</TableHead>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("slug")}</TableHead>
                    <TableHead>{t("createdAt")}</TableHead>
                    <TableHead>{t("updatedAt")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org._id}>
                      <TableCell className="font-mono text-xs">
                        {org._id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {org.name || "—"}
                      </TableCell>
                      <TableCell>{org.slug || "—"}</TableCell>
                      <TableCell>
                        {org._createdAt
                          ? new Date(org._createdAt).toLocaleDateString(locale)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {org._updatedAt
                          ? new Date(org._updatedAt).toLocaleDateString(locale)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableCaption>
                  {t("total")}: {totalCount} {t("organizationsCount")}
                </TableCaption>
              </Table>

              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1)
                            handlePageChange(currentPage - 1);
                        }}
                        {...(currentPage === 1
                          ? { "aria-disabled": "true", tabIndex: -1 }
                          : {})}
                      />
                    </PaginationItem>

                    {/* First page */}
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(1);
                          }}
                          isActive={currentPage === 1}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Ellipsis if needed */}
                    {currentPage > 4 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {/* Page before current if available */}
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage - 1);
                          }}
                        >
                          {currentPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Current page */}
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>

                    {/* Page after current if available */}
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage + 1);
                          }}
                        >
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Ellipsis if needed */}
                    {currentPage < totalPages - 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(totalPages);
                          }}
                          isActive={currentPage === totalPages}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages)
                            handlePageChange(currentPage + 1);
                        }}
                        {...(currentPage === totalPages
                          ? { "aria-disabled": "true", tabIndex: -1 }
                          : {})}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                {t("noOrganizationsFound")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
