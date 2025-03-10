import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/hooks/use-accounts";
import { useTranslation } from "@/lib/translation";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
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
import { useState } from "react";

interface MembersListProps {
  accountIds?: string[];
  isOwner: (accountId: string) => boolean;
  onRemoveMember?: (accountId: string) => void;
  isCurrentUserOwner?: boolean;
  isRemoving?: boolean;
}

export function MembersList({
  accountIds,
  isOwner,
  onRemoveMember,
  isCurrentUserOwner = false,
  isRemoving = false,
}: MembersListProps) {
  const { t } = useTranslation();
  const { data: accounts, isLoading, isError, error } = useAccounts(accountIds);
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(
    null
  );

  // Handle member removal
  const handleRemoveMember = (accountId: string) => {
    if (onRemoveMember) {
      onRemoveMember(accountId);
    }
    setConfirmingRemoveId(null);
  };

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

  // Show error state
  if (isError) {
    return (
      <div className="py-4 text-destructive">
        {error instanceof Error ? error.message : t("errorLoadingMembers")}
      </div>
    );
  }

  // Show empty state
  if (!accounts || accounts.length === 0) {
    return (
      <div className="py-4 text-muted-foreground">{t("noMembersFound")}</div>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => {
        const accountId = account._id || "";
        const isAccountOwner = isOwner(accountId);

        return (
          <div
            key={accountId}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                {/* <AvatarImage src={account.avatar} alt={account._email} /> */}
                <AvatarFallback>{account.getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{account.getFullname()}</div>
                <div className="text-sm text-muted-foreground">
                  {account._email}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {account._createdAt && (
                <span className="text-xs text-muted-foreground">
                  {t("joinedMemberTime", {
                    time: formatDistanceToNow(new Date(account._createdAt), {
                      addSuffix: true,
                    }),
                  })}
                </span>
              )}
              {isAccountOwner && (
                <Badge variant="outline" className="ml-2">
                  {t("owner")}
                </Badge>
              )}

              {/* Remove member button (only shown for non-owners and if current user is owner) */}
              {isCurrentUserOwner && !isAccountOwner && onRemoveMember && (
                <AlertDialog
                  open={confirmingRemoveId === accountId}
                  onOpenChange={(open: boolean) => {
                    if (!open) setConfirmingRemoveId(null);
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmingRemoveId(accountId)}
                      disabled={isRemoving}
                    >
                      <UserX className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("removeMemberTitle")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("removeMemberDescription", {
                          member: account.getFullname(),
                        })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemoveMember(accountId)}
                        className="bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        disabled={isRemoving}
                      >
                        {isRemoving ? t("removing") : t("remove")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
