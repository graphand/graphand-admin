import {
  MutateOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import client from "@/lib/graphand-client";
import { useCallback } from "react";
import { useMe } from "@/hooks/use-me";

/**
 * Hook to manage organization members
 * @param organizationId The ID of the organization
 * @returns Mutation functions for managing members
 */
export function useOrganizationMembers(organizationId?: string) {
  const queryClient = useQueryClient();
  const { user } = useMe();

  // Mutation for removing a member from the organization
  const removeMemberMutation = useMutation({
    mutationFn: async (accountId: string) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      // Get the current organization to check if the user is the owner
      const organization = await client
        .model("organizations")
        .get(organizationId);

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Check if the account to remove is the owner
      const ownerId = organization.get("owner", "json");
      if (accountId === ownerId) {
        throw new Error("Cannot remove the owner of the organization");
      }

      // Use the specialized API endpoint for removing an account
      return client.execute(
        {
          path: `/organizations/:id/remove-account`,
          methods: ["post"],
          secured: false,
        },
        {
          params: { id: organizationId },
          data: {
            accountId: accountId,
          },
        }
      );
    },
    onSuccess: () => {
      // Invalidate queries to update the UI with the latest data
      // Invalidate the organization query to refetch the data
      queryClient.invalidateQueries({
        queryKey: ["organization", organizationId],
      });

      // Invalidate any account-related queries to refresh the members list
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      // Force refetch the organization data
      queryClient.refetchQueries({
        queryKey: ["organization", organizationId],
      });
    },
  });

  // Mutation for leaving an organization (removing yourself)
  const leaveOrganizationMutation = useMutation({
    mutationFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      if (!user) {
        throw new Error("You must be logged in to leave an organization");
      }

      const currentUserId = user.get("_id");

      if (!currentUserId) {
        throw new Error("User ID not found");
      }

      // Get the current organization to check if the user is the owner
      const organization = await client
        .model("organizations")
        .get(organizationId);

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Check if current user is the owner
      const ownerId = organization.get("owner", "json");
      if (ownerId === currentUserId) {
        throw new Error("The owner cannot leave the organization");
      }

      // Use the specialized API endpoint for leaving an organization
      return client.execute(
        {
          path: `/organizations/:id/leave`,
          methods: ["post"],
          secured: false,
        },
        {
          params: { id: organizationId },
        }
      );
    },
    onSuccess: () => {
      // Invalidate multiple queries to update the UI
      // Invalidate organization-related queries
      queryClient.invalidateQueries({
        queryKey: ["organization", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-organizations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });

      // Invalidate any account-related queries
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });

  // Function to remove a member
  const removeMember = useCallback(
    (accountId: string, options?: MutateOptions<Response, Error, string>) => {
      return removeMemberMutation.mutate(accountId, options);
    },
    [removeMemberMutation]
  );

  // Function to leave an organization
  const leaveOrganization = useCallback(
    (options?: MutateOptions<Response, Error, void>) => {
      return leaveOrganizationMutation.mutate(undefined, options);
    },
    [leaveOrganizationMutation]
  );

  return {
    removeMember,
    isRemoving: removeMemberMutation.isPending,
    leaveOrganization,
    isLeaving: leaveOrganizationMutation.isPending,
  };
}
