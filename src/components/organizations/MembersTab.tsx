import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/translation";
import { MembersList } from "@/components/organizations/MembersList";
import { InvitationsList } from "@/components/organizations/InvitationsList";
import { InviteMembers } from "@/components/organizations/InviteMembers";
import {
  useOrganizationInvitations,
  InvitationStatus,
} from "@/hooks/use-organization-invitations";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface MembersTabProps {
  organization: any;
  isLoading: boolean;
}

export function MembersTab({ organization, isLoading }: MembersTabProps) {
  const { t } = useTranslation();
  const organizationId = organization?.get("_id");
  const [invitationStatus, setInvitationStatus] =
    useState<InvitationStatus>("pending");

  const {
    invitations,
    isLoading: isLoadingInvitations,
    isError,
    error,
    createInvitation,
    deleteInvitation,
    resendInvitation,
    isPending,
  } = useOrganizationInvitations(organizationId, invitationStatus);

  const handleInvite = ({
    email,
    transferOwnership,
  }: {
    email: string;
    transferOwnership: boolean;
  }) => {
    createInvitation(
      { email, transferOwnership },
      {
        onSuccess: () => {
          toast.success(t("invitationSent", { email }));
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : t("errorSendingInvitation")
          );
        },
      }
    );
  };

  const handleDeleteInvitation = (invitationId: string) => {
    deleteInvitation(invitationId, {
      onSuccess: () => {
        toast.success(t("invitationDeleted"));
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : t("errorDeletingInvitation")
        );
      },
    });
  };

  const handleResendInvitation = (invitationId: string) => {
    resendInvitation(invitationId, {
      onSuccess: () => {
        toast.success(t("invitationResent"));
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : t("errorResendingInvitation")
        );
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle>{t("organizationMembers")}</CardTitle>
          <CardDescription>{t("manageOrganizationMembers")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <MembersList
              accountIds={organization?.get("_accounts", "json")}
              isOwner={(accountId: string) => {
                const ownerId = organization?.get("owner", "json");
                return Boolean(ownerId && ownerId === accountId);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Invitations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("invitations")}</CardTitle>
            <CardDescription>
              {t("manageOrganizationInvitations")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="pending"
            value={invitationStatus}
            onValueChange={(value) =>
              setInvitationStatus(value as InvitationStatus)
            }
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                {t("pendingInvitations")} 📧
              </TabsTrigger>
              <TabsTrigger value="accepted">
                {t("acceptedInvitations")} ✅
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6">
              {/* Invite Form - only shown for pending tab */}
              <div>
                <h3 className="text-sm font-medium mb-2">
                  {t("inviteNewMember")}
                </h3>
                <InviteMembers onInvite={handleInvite} isPending={isPending} />
              </div>

              <hr className="my-4 border-t border-border" />

              {/* Pending Invitations List */}
              <div>
                <h3 className="text-sm font-medium mb-2">
                  {t("currentInvitations")}
                </h3>
                <InvitationsList
                  invitations={invitations}
                  isLoading={isLoadingInvitations}
                  onDelete={handleDeleteInvitation}
                  onResend={handleResendInvitation}
                  isPending={isPending}
                  status="pending"
                />
              </div>
            </TabsContent>

            <TabsContent value="accepted" className="space-y-6">
              {/* Accepted Invitations List */}
              <div>
                <h3 className="text-sm font-medium mb-2">
                  {t("previouslyAcceptedInvitations")}
                </h3>
                <InvitationsList
                  invitations={invitations}
                  isLoading={isLoadingInvitations}
                  onDelete={handleDeleteInvitation}
                  onResend={handleResendInvitation}
                  isPending={isPending}
                  status="accepted"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
