import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import client from "@/lib/graphand-client";

export function useOrganizations(pageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

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
      const list = await client.model("organizations").getList({
        filter: {
          $expr: {
            $in: ["$$accountId", "$_accounts"],
          },
        },
        pageSize,
        page: pageParam,
      });

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

  return {
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
    currentPage,
    setCurrentPage,
    handlePageChange,
    organizations,
    totalPages,
    totalCount,
  };
}
