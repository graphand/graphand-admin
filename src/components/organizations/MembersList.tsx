import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/hooks/use-accounts";
import { useTranslation } from "@/lib/translation";
import { formatDistanceToNow } from "date-fns";

interface MembersListProps {
  accountIds?: string[];
  isOwner: (accountId: string) => boolean;
}

export function MembersList({ accountIds, isOwner }: MembersListProps) {
  const { t } = useTranslation();
  const { data: accounts, isLoading, isError, error } = useAccounts(accountIds);

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
      {accounts.map((account) => (
        <div
          key={account._id}
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
            {isOwner(account._id || "") && (
              <Badge variant="outline" className="ml-2">
                {t("owner")}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
