"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Building,
  Loader2,
  ChevronDown,
  ChevronUp,
  LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/translation";
import client from "@/lib/graphand-client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function OrganizationsJoinPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [organizationId, setOrganizationId] = useState(
    searchParams.get("organizationId") || searchParams.get("organization") || ""
  );
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTokenField, setShowTokenField] = useState(false);
  const [tokenValue, setTokenValue] = useState(token || "");
  const [invitationUrl, setInvitationUrl] = useState("");
  const [processingUrl, setProcessingUrl] = useState(false);

  // Extract parameters from invitation URL
  const handleExtractParams = () => {
    try {
      setProcessingUrl(true);
      setError(null);

      if (!invitationUrl.trim()) {
        setError(t("url_required") || "Please enter a valid invitation URL");
        setProcessingUrl(false);
        return;
      }

      const url = new URL(invitationUrl);

      // Get query parameters from the URL
      const urlParams = new URLSearchParams(url.search);
      const orgId =
        urlParams.get("organization") || urlParams.get("organizationId");
      const tokenParam = urlParams.get("token");

      if (!orgId || !tokenParam) {
        setError(
          t("invalid_invitation_url") ||
            "The invitation URL is missing required parameters"
        );
        setProcessingUrl(false);
        return;
      }

      // Set the extracted parameters
      setOrganizationId(orgId);
      setToken(tokenParam);
      setTokenValue(tokenParam);

      // Update URL without reloading the page
      const newUrl = `/organizations/join?organizationId=${orgId}&token=${tokenParam}`;
      window.history.replaceState({}, "", newUrl);

      setProcessingUrl(false);
    } catch (err) {
      console.error("Error parsing URL:", err);
      setError(t("invalid_url_format") || "Please enter a valid URL");
      setProcessingUrl(false);
    }
  };

  // TokenField component for advanced options
  const TokenField = () => (
    <div className="mb-4">
      <Button
        variant="ghost"
        className="flex w-full items-center justify-between p-2 text-sm"
        onClick={() => setShowTokenField(!showTokenField)}
        type="button"
      >
        <span>{t("advanced_options")}</span>
        {showTokenField ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      {showTokenField && (
        <div className="mt-2 border rounded-md p-3 bg-muted/40">
          <p className="text-xs text-muted-foreground mb-2">
            {t("token_edit_description")}
          </p>
          <Input
            value={tokenValue}
            onChange={(e) => setTokenValue(e.target.value)}
            placeholder={t("invitation_token")}
            className="bg-background"
          />
        </div>
      )}
    </div>
  );

  // Fetch organization details
  const {
    data: organization,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      try {
        return await client.model("organizations").get(organizationId);
      } catch (err) {
        console.error("Error fetching organization:", err);
        throw err;
      }
    },
    enabled: !!organizationId && !!tokenValue,
  });

  // Handle join organization
  const handleJoin = async () => {
    if (!organizationId || !tokenValue) return;

    try {
      setIsJoining(true);
      setError(null);

      await client.execute(
        {
          path: `/organizations/:id/join`,
          methods: ["post"],
          secured: true,
        },
        {
          params: { id: organizationId },
          data: { token: tokenValue },
        }
      );

      // Show success toast notification
      toast.success(
        t("join_organization_success") || "Successfully joined organization"
      );

      // Redirect to organizations list or dashboard
      router.push(`/organizations/${organizationId}`);
    } catch (err) {
      console.error("Join organization error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("join_organization_error"));
      }
    } finally {
      setIsJoining(false);
    }
  };

  // Check if required parameters are present
  if (!organizationId || !token) {
    return (
      <div className="container mx-auto flex flex-1 items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {t("join_organization") || "Join Organization"} 🤝
            </CardTitle>
            <CardDescription>
              {t("paste_invitation_url_description") ||
                "Paste the invitation URL to join an organization"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t("invitation_url_hint") ||
                    "Enter the full invitation URL (e.g., https://app.graphand.cloud/join?organization=...&token=...)"}
                </p>
                <div className="flex space-x-2">
                  <Input
                    value={invitationUrl}
                    onChange={(e) => setInvitationUrl(e.target.value)}
                    placeholder={t("invitation_url") || "Invitation URL"}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleExtractParams}
                    disabled={processingUrl || !invitationUrl}
                  >
                    {processingUrl ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LinkIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  {t("have_organization_id_token") ||
                    "Already have organization ID and token?"}{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => {
                      router.push(
                        `/organizations/join?organizationId=manual&token=manual`
                      );
                    }}
                  >
                    {t("enter_manually") || "Enter manually"}
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/organizations">
              <Button variant="outline">{t("back_to_organizations")}</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-1 items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {t("join_organization")} 🤝
          </CardTitle>
          <CardDescription>
            {t("join_organization_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError || !organization ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {fetchError instanceof Error
                  ? fetchError.message
                  : t("organization_fetch_error")}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="mb-6 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <Building className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">
                      {organization.name || t("organization")}
                    </h3>
                    {/* {organization. && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {organization.description}
                      </p>
                    )} */}
                  </div>
                </div>
              </div>

              <TokenField />

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("joining")}
                  </>
                ) : (
                  t("accept_invitation")
                )}
              </Button>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <p className="text-sm text-center text-muted-foreground">
            <Link href="/organizations" className="hover:underline">
              {t("back_to_organizations")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
