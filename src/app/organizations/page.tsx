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
import { useOrganizations } from "@/hooks/use-organizations";
import { useTranslation } from "@/lib/translation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function OrganizationPage() {
  const { t } = useTranslation();

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

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <div className="text-3xl font-bold">{t("organizations")}</div>
          <Button asChild variant="default">
            <Link href="/organizations/create" className="gap-2">
              <PlusIcon className="h-4 w-4" />
              {t("createOrganization")}
            </Link>
          </Button>
        </div>
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
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <div className="text-3xl font-bold">{t("organizations")}</div>
          <Button asChild variant="default">
            <Link href="/organizations/create" className="gap-2">
              <PlusIcon className="h-4 w-4" />
              {t("createOrganization")}
            </Link>
          </Button>
        </div>
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
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="text-3xl font-bold">{t("organizations")}</div>
        <Button asChild variant="default">
          <Link href="/organizations/create" className="gap-2">
            <PlusIcon className="h-4 w-4" />
            {t("createOrganization")}
          </Link>
        </Button>
      </div>
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
                          ? new Date(org._createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {org._updatedAt
                          ? new Date(org._updatedAt).toLocaleDateString()
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
