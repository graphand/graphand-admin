"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import client from "@/lib/graphand-client";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ModelInstance } from "@graphand/core";
import Organization from "@/lib/models/Organization";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function OrganizationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch organizations using infinite query
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useInfiniteQuery({
    queryKey: ["organizations"],
    queryFn: async ({ pageParam = 1 }) => {
      const list = await client
        .model("organizations")
        .getList({ pageSize, page: pageParam });

      // Safely extract count
      const count = typeof list.count === "number" ? list.count : 0;

      return {
        items: list,
        nextPage: list.length === pageSize ? pageParam + 1 : undefined,
        prevPage: pageParam > 1 ? pageParam - 1 : undefined,
        totalPages: Math.ceil(count / pageSize),
        currentPage: pageParam,
        totalCount: count,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
  });

  // Render loading state
  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Organizations</h1>
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
        <h1 className="text-3xl font-bold mb-6">Organizations</h1>
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

  // Handle page change
  const handlePageChange = (page: number) => {
    if (data) {
      // Find the page in existing data or fetch it
      const pageIndex = page - 1;
      if (pageIndex >= 0 && pageIndex < data.pages.length) {
        setCurrentPage(page);
      } else if (page > currentPage) {
        fetchNextPage();
        setCurrentPage(page);
      } else if (page < currentPage) {
        fetchPreviousPage();
        setCurrentPage(page);
      }
    }
  };

  // Get current page data
  const currentPageData = data?.pages.find(
    (pageData) => pageData.currentPage === currentPage
  );
  const organizations = currentPageData?.items || [];
  const totalPages = currentPageData?.totalPages || 1;
  const totalCount = currentPageData?.totalCount || 0;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Organizations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Organizations</CardTitle>
          <CardDescription>View and manage your organizations</CardDescription>
        </CardHeader>
        <CardContent>
          {organizations.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
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
                <TableCaption>Total: {totalCount} organizations</TableCaption>
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
              <p className="text-muted-foreground">No organizations found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
