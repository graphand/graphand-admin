import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/translation";
import { useCurrentSubscription } from "@/hooks/use-current-subscription";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useSubscriptionPortal } from "@/hooks/use-subscription-portal";
import { ExternalLink, Loader2 } from "lucide-react";

interface SubscriptionTabProps {
  projectId: string;
}

export function SubscriptionTab({ projectId }: SubscriptionTabProps) {
  const { t } = useTranslation();
  const {
    data: subscription,
    isLoading,
    error,
  } = useCurrentSubscription(projectId);
  const { openBillingPortal, isLoading: isPortalLoading } =
    useSubscriptionPortal(projectId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("projectSubscription")}</CardTitle>
          {subscription && subscription.status === "active" && (
            <Button
              variant="outline"
              onClick={() => openBillingPortal()}
              disabled={isPortalLoading}
              className="flex items-center gap-1"
            >
              {isPortalLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  {t("loadingBillingPortal")}
                </>
              ) : (
                <>
                  {t("billingPortal")} <ExternalLink className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {error && (
            <p className="text-destructive">{t("errorFetchingSubscription")}</p>
          )}

          {!isLoading && !error && !subscription && (
            <p>{t("projectSubscriptionPlaceholder")}</p>
          )}

          {subscription && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{subscription.plan}</h3>
                <Badge
                  variant={
                    subscription.status === "active" ? "default" : "outline"
                  }
                >
                  {subscription.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("subscriptionPeriod")}
                  </p>
                  <p>
                    {subscription.periodStartDate &&
                      format(new Date(subscription.periodStartDate), "PP")}{" "}
                    -
                    {subscription.periodEndDate &&
                      format(new Date(subscription.periodEndDate), "PP")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("subscriptionPrice")}
                  </p>
                  <p>
                    {subscription.price} {subscription.currency} /{" "}
                    {subscription.interval}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
