import { useInfiniteQuery } from "@tanstack/react-query";
import client from "@/lib/graphand-client";
import { Filter, Sort } from "@graphand/core";

export type Project = {
  _id: string;
  name: string;
  slug: string;
  organization: string; // Organization ID
  version?: string;
  _createdAt?: string;
  _updatedAt?: string;
  // Add other fields as needed
};

export function useDashboardProjects(
  organizationId: string,
  showArchived: boolean = false,
  pageSize: number = 10
) {
  return useInfiniteQuery({
    queryKey: ["dashboard-projects", organizationId, showArchived],
    queryFn: async ({ pageParam = 1 }) => {
      // Create filter based on showArchived flag
      const filter: Filter = {
        organization: organizationId,
      };
      let sort: Sort = {
        _createdAt: -1,
      };

      // Add slug filter based on the archived state
      if (showArchived) {
        // Only show archived projects (slugs starting with _archive)
        filter.slug = { $regex: "^_archive", $options: "i" };
        sort = { "__metadata.archivedAt": -1 };
      } else {
        // Only show regular projects (slugs NOT starting with _archive)
        filter.slug = { $regex: "^(?!_archive)", $options: "i" };
        sort = { _createdAt: -1 };
      }

      const response = await client.model("projects").getList({
        pageSize,
        page: pageParam,
        filter,
        sort,
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
    enabled: !!organizationId, // Only run the query if we have an organization ID
  });
}
