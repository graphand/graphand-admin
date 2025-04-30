"use client";

import React, { useState } from "react";
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
  ChevronDown,
  ChevronUp,
  LinkIcon,
  Loader2,
} from "lucide-react";
import client from "@/lib/graphand-client";
import RegisterForm, { RegisterFormValues } from "@/components/register-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translation";

export default function JoinOrganizationPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [organizationId, setOrganizationId] = useState(
    searchParams.get("organizationId") || searchParams.get("organization") || ""
  );
  const [token, setToken] = useState(searchParams.get("token") || "");
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
      const newUrl = `/auth/join-organization?organizationId=${orgId}&token=${tokenParam}`;
      window.history.replaceState({}, "", newUrl);

      setProcessingUrl(false);
    } catch (err) {
      console.error("Error parsing URL:", err);
      setError(t("invalid_url_format") || "Please enter a valid URL");
      setProcessingUrl(false);
    }
  };

  // Check if required parameters are present
  if (!organizationId || !token) {
    return (
      <div className="container mx-auto flex flex-1 items-center justify-center">
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
                        `/auth/join-organization?organizationId=manual&token=manual`
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
            <p className="text-sm text-center">
              <Link
                href="/auth/login"
                className="font-semibold hover:underline"
              >
                {t("login") || "Go to login page"}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Handle form submission
  const onSubmit = async (values: RegisterFormValues) => {
    try {
      // Verify the token and register the user in the organization
      await client.execute(
        {
          path: `/organizations/:id/join`,
          methods: ["post"],
          secured: false,
        },
        {
          params: { id: organizationId },
          data: {
            token: tokenValue, // Use the managed token value
            register: {
              firstname: values.firstname,
              lastname: values.lastname,
              email: values.email,
              password: values.password,
            },
          },
        }
      );

      // Keep loading state true during redirection
      router.push("/auth/login?message=organization-joined");
    } catch (err) {
      console.error("Join organization error:", err);
      // If it's a regular error not caught by GenericForm, show it here
      if (!(err instanceof Error)) {
        setError(t("join_organization_error") || "An unknown error occurred");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(t("join_organization_error") || "Failed to join organization");
      }

      // Let GenericForm handle validation errors
      throw err;
    }
  };

  // Collapsible token field component
  const TokenField = () => (
    <div className="mb-4">
      <Button
        variant="ghost"
        className="flex w-full items-center justify-between p-2 text-sm"
        onClick={() => setShowTokenField(!showTokenField)}
        type="button"
      >
        <span>{t("advanced_options") || "Advanced Options"}</span>
        {showTokenField ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      {showTokenField && (
        <div className="mt-2 border rounded-md p-3 bg-muted/40">
          <p className="text-xs text-muted-foreground mb-2">
            {t("token_edit_description") ||
              "This field is pre-filled with your invitation token. You typically don't need to modify it."}
          </p>
          <Input
            value={tokenValue}
            onChange={(e) => setTokenValue(e.target.value)}
            placeholder={t("invitation_token") || "Invitation token"}
            className="bg-background"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {t("join_organization") || "Join Organization"} 🤝
          </CardTitle>
          <CardDescription>
            {t("join_organization_description") ||
              "Complete your information to join the organization"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <RegisterForm
            onSubmit={onSubmit}
            submitButtonText={t("accept_invitation") || "Join Organization"}
            loadingButtonText={t("joining") || "Processing..."}
            serverErrorMappings={{
              firstname: ["firstname"],
              lastname: ["lastname"],
              email: ["email"],
              password: ["password"],
            }}
            beforeFields={<TokenField />}
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            {t("already_have_account") || "Already have an account?"}{" "}
            <Link
              href={`/organizations/join?organizationId=${organizationId}&token=${token}`}
              className="font-semibold hover:underline"
            >
              {t("login") || "Login"}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
