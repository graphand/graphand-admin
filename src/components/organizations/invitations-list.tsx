import { Mail, Trash, RotateCw, CheckCircle, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lib/translation";
import { formatDistanceToNow } from "date-fns";
import { ModelInstance } from "@graphand/core";
import client from "@/lib/graphand";
import { InvitationStatus } from "@/hooks/use-organization-invitations";

interface InvitationsListProps {
  invitations?: ModelInstance<
    ReturnType<typeof client.model<"organizationInvitations">>
  >[];
  isLoading: boolean;
  onDelete: (invitationId: string) => void;
  onResend: (invitationId: string) => void;
  isPending: boolean;
  status: InvitationStatus;
}

export function InvitationsList({
  invitations,
  isLoading,
  onDelete,
  onResend,
  isPending,
  status,
}: InvitationsListProps) {
  const { t } = useTranslation();

  // Show loading state
  if (isLoading) {
    return (
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
    );
  }

  // Show empty state
  if (!invitations || invitations.length === 0) {
    return (
      <div className="py-4 text-muted-foreground">
        {status === "pending"
          ? t("noInvitationsPending")
          : t("noInvitationsAccepted")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => {
        const account = invitation.get("account", "json");

        return (
          <div
            key={invitation._id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback>
                  {status === "pending" ? (
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <UserCheck className="h-5 w-5 text-green-500" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {invitation.email}
                  {status === "accepted" && account && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({account})
                    </span>
                  )}
                </div>
                {invitation._createdAt && (
                  <div className="text-xs text-muted-foreground">
                    {status === "pending"
                      ? t("invitedTime", {
                          time: formatDistanceToNow(
                            new Date(invitation._createdAt),
                            {
                              addSuffix: true,
                            }
                          ),
                        })
                      : t("acceptedTime", {
                          time: formatDistanceToNow(
                            new Date(
                              invitation._updatedAt || invitation._createdAt
                            ),
                            {
                              addSuffix: true,
                            }
                          ),
                        })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {invitation.transferOwnership && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-800 border-yellow-200"
                >
                  {t("transferOwnership")}
                </Badge>
              )}

              {status === "accepted" && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-800 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {t("accepted")}
                </Badge>
              )}

              {/* Only show action buttons for pending invitations */}
              {status === "pending" && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onResend(invitation._id ?? "")}
                    disabled={isPending}
                    title={t("resendInvitation")}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        disabled={isPending}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("deleteInvitationTitle")}</DialogTitle>
                        <DialogDescription>
                          {t("deleteInvitationDescription", {
                            email: invitation.email,
                          })}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>
                          {t("cancel")}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => onDelete(invitation._id ?? "")}
                        >
                          {t("delete")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
