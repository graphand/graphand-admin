import { useInfiniteQuery } from "@tanstack/react-query";
import client from "@/lib/graphand-client";

export type Organization = {
  _id: string;
  name: string;
  slug: string;
  _createdAt?: string;
  _updatedAt?: string;
  // Add other fields as needed
};

export function useDashboardOrganizations(pageSize: number = 10) {
  return useInfiniteQuery({
    queryKey: ["dashboard-organizations"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await client.model("organizations").getList({
        filter: {
          $expr: {
            $in: ["$$accountId", "$_accounts"],
          },
        },
        pageSize,
        page: pageParam,
        sort: { name: 1 }, // Sort by name ascending
      });

      // Extract items and count
      const items = response || [];
      const count = typeof response.count === "number" ? response.count : 0;

      return {
        items,
        nextPage: items.length === pageSize ? pageParam + 1 : undefined,
        totalCount: count,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
