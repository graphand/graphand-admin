import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/translation";
import { MembersList } from "@/components/organizations/MembersList";
import { InvitationsList } from "@/components/organizations/InvitationsList";
import { InviteMembers } from "@/components/organizations/InviteMembers";
import {
  useOrganizationInvitations,
  InvitationStatus,
} from "@/hooks/use-organization-invitations";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { useMe } from "@/hooks/use-me";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { ModelInstance } from "@graphand/core";
import Organization from "@/lib/models/Organization";

interface MembersTabProps {
  organization: ModelInstance<typeof Organization>;
  isLoading: boolean;
}

export function MembersTab({ organization, isLoading }: MembersTabProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const organizationId = organization?.get("_id");
  const organizationName = organization?.get("name");
  const ownerId = organization?.get("owner", "json");
  const [invitationStatus, setInvitationStatus] =
    useState<InvitationStatus>("pending");
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  // Get current user
  const { user } = useMe();
  // Check if the current user is the owner of the organization
  const isCurrentUserOwner = user && ownerId === user.get("_id");
  // Current user is a member but not the owner
  const isCurrentUserMember =
    user &&
    !isCurrentUserOwner &&
    organization?.get("_accounts", "json")?.includes(user._id);

  const {
    invitations,
    isLoading: isLoadingInvitations,
    createInvitation,
    deleteInvitation,
    resendInvitation,
    isPending,
  } = useOrganizationInvitations(organizationId, invitationStatus);

  // Get organization members management functions
  const { removeMember, isRemoving, leaveOrganization, isLeaving } =
    useOrganizationMembers(organizationId);

  const handleInvite = ({
    email,
    transferOwnership,
  }: {
    email: string;
    transferOwnership: boolean;
  }) => {
    // Ensure only owners can transfer ownership
    if (transferOwnership && !isCurrentUserOwner) {
      toast.error(t("onlyOwnerCanTransferOwnership"));
      return;
    }

    createInvitation(
      { email, transferOwnership },
      {
        onSuccess: () => {
          if (transferOwnership) {
            toast.success(t("transferOwnershipSuccessful", { email }));
          } else {
            toast.success(t("invitationSent", { email }));
          }
        },
        onError: (error) => {
          if (transferOwnership) {
            toast.error(
              error instanceof Error
                ? error.message
                : t("transferOwnershipError")
            );
          } else {
            toast.error(
              error instanceof Error
                ? error.message
                : t("errorSendingInvitation")
            );
          }
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

  // Handle removing a member from the organization
  const handleRemoveMember = (accountId: string) => {
    // Don't allow removal of the owner
    if (accountId === ownerId) {
      toast.error(t("cannotRemoveOwner"));
      return;
    }

    removeMember(accountId, {
      onSuccess: () => {
        toast.success(t("memberRemoved"));
      },
      onError: (error: Error) => {
        toast.error(
          error instanceof Error ? error.message : t("errorRemovingMember")
        );
      },
    });
  };

  // Handle leaving the organization
  const handleLeaveOrganization = () => {
    leaveOrganization({
      onSuccess: () => {
        toast.success(t("leftOrganization"));
        // Navigate back to the organizations list
        router.push("/organizations");
        router.refresh();
      },
      onError: (error: Error) => {
        toast.error(
          error instanceof Error ? error.message : t("errorLeavingOrganization")
        );
        setIsLeaveDialogOpen(false);
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
              accountIds={organization?.get("_accounts", "json") || []}
              isOwner={(accountId: string) => {
                return Boolean(ownerId && ownerId === accountId);
              }}
              onRemoveMember={handleRemoveMember}
              isCurrentUserOwner={Boolean(isCurrentUserOwner)}
              isRemoving={isRemoving}
            />
          )}
        </CardContent>

        {/* Leave Organization - Only shown for non-owner members */}
        {isCurrentUserMember && (
          <CardFooter className="pt-4 border-t flex justify-end">
            <AlertDialog
              open={isLeaveDialogOpen}
              onOpenChange={setIsLeaveDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive flex items-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t("leaveOrganization")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("leaveOrganizationTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("leaveOrganizationDescription", {
                      organization: organizationName,
                    })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLeaveOrganization}
                    className="bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    disabled={isLeaving}
                  >
                    {isLeaving ? t("leaving") : t("leave")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        )}
      </Card>

      {/* Invite members section - only visible for organization owners or members */}
      {!isLoading && (isCurrentUserOwner || isCurrentUserMember) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("inviteMembers")}</CardTitle>
            <CardDescription>{t("inviteMembersDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <InviteMembers
              onInvite={handleInvite}
              isPending={isPending}
              isOwner={!!isCurrentUserOwner}
            />
          </CardContent>
        </Card>
      )}

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
              {/* Pending Invitations List */}
              <div>
                <h3 className="text-sm font-medium mb-2">
                  {t("pendingInvitations")}
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
