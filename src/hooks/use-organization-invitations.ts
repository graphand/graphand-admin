import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "@/lib/graphand-client";
import { Filter } from "@graphand/core";

export type InvitationStatus = "pending" | "accepted";

/**
 * Hook to fetch and manage organization invitations
 * @param organizationId The ID of the organization to fetch invitations for
 * @param status Filter invitations by status (pending or accepted)
 * @returns Query result containing the invitations and mutation functions
 */
export function useOrganizationInvitations(
  organizationId?: string,
  status: InvitationStatus = "pending"
) {
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: ["organization-invitations", organizationId, status],
    queryFn: async () => {
      if (!organizationId) {
        return [];
      }

      try {
        const filter: Filter = {
          organization: organizationId,
        };

        // For accepted invitations, the account field is set
        // For pending invitations, the account field is not set
        if (status === "accepted") {
          filter.account = { $exists: true };
        } else {
          filter.account = { $exists: false };
        }

        return await client.model("organizationInvitations").getList({
          filter,
          sort: { _createdAt: -1 }, // Sort by creation date, newest first
        });
      } catch (error) {
        console.error("Error fetching organization invitations:", error);
        throw error;
      }
    },
    enabled: !!organizationId,
  });

  // Mutation for creating new invitations
  const createInvitationMutation = useMutation({
    mutationFn: async ({
      email,
      transferOwnership = false,
    }: {
      email: string;
      transferOwnership?: boolean;
    }) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      return client.model("organizationInvitations").create({
        email,
        organization: organizationId,
        transferOwnership,
      });
    },
    onSuccess: () => {
      // Invalidate the invitations query to refetch the data
      queryClient.invalidateQueries({
        queryKey: ["organization-invitations", organizationId],
      });
    },
  });

  // Mutation for deleting invitations
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return client.model("organizationInvitations").delete(invitationId);
    },
    onSuccess: () => {
      // Invalidate the invitations query to refetch the data
      queryClient.invalidateQueries({
        queryKey: ["organization-invitations", organizationId],
      });
    },
  });

  // Mutation for resending invitations
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      // For now, we'll just refetch the invitation, which should trigger a resend on the backend
      // In a real implementation, there would be a specific endpoint or method for this
      return client.model("organizationInvitations").get(invitationId);
    },
    onSuccess: () => {
      // Invalidate the invitations query to refetch the data
      queryClient.invalidateQueries({
        queryKey: ["organization-invitations", organizationId],
      });
    },
  });

  return {
    invitations: invitationsQuery.data,
    isLoading: invitationsQuery.isLoading,
    isError: invitationsQuery.isError,
    error: invitationsQuery.error,
    createInvitation: createInvitationMutation.mutate,
    deleteInvitation: deleteInvitationMutation.mutate,
    resendInvitation: resendInvitationMutation.mutate,
    isPending:
      createInvitationMutation.isPending ||
      deleteInvitationMutation.isPending ||
      resendInvitationMutation.isPending,
  };
}
