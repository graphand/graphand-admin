"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/translation";
import client from "@/lib/graphand-client";
import { toast } from "sonner";
import { useLogged } from "@/hooks/use-logged";
import { useInstance } from "@/hooks/use-instance";
import { useMe } from "@/hooks/use-me";
import LoginForm, { LoginFormValues } from "@/components/login-form";
import RegisterForm, { RegisterFormValues } from "@/components/register-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Controller } from "@graphand/core";
import EmailVerificationAlert from "@/components/email-verification-alert";

export default function JoinOrganizationPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const orgId = searchParams.get("org") || "";
  const token = searchParams.get("token") || "";
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTokenField, setShowTokenField] = useState(false);
  const [tokenValue, setTokenValue] = useState(token || "");
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const isLogged = useLogged();
  const me = useMe();
  const {
    data: organization,
    isLoading,
    isError,
    error: fetchError,
  } = useInstance(client.model("organizations"), isLogged ? orgId : undefined);

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

  // Handle login submission
  const handleLogin = async (values: LoginFormValues) => {
    if (!orgId || !tokenValue) return;

    setIsJoining(true);
    setError(null);

    await client.get("auth").login({
      credentials: {
        email: values.email,
        password: values.password,
      },
    });

    await handleJoin();
  };

  // Handle register submission
  const handleRegister = async (values: RegisterFormValues) => {
    if (!orgId || !tokenValue) return;

    const controllerOrganizationJoin: Controller<{
      params: { id: string };
      data: {
        token: string;
        register?: {
          firstname: string;
          lastname: string;
          email: string;
          password: string;
        };
      };
    }> = {
      path: "/organizations/:id/join",
      methods: ["post"],
      secured: false,
    };

    // Call the Graphand auth module to register
    await client.execute(controllerOrganizationJoin, {
      params: { id: orgId },
      data: {
        token: tokenValue,
        register: {
          firstname: values.firstname,
          lastname: values.lastname,
          email: values.email,
          password: values.password,
        },
      },
    });

    // Show success toast notification
    toast.success(
      t("join_organization_success") || "Successfully joined organization"
    );

    await client.get("auth").login({
      credentials: {
        email: values.email,
        password: values.password,
      },
    });

    // Redirect to organizations list or dashboard
    router.push(`/organizations/${orgId}`);
  };

  // Handle join organization
  const handleJoin = async () => {
    if (!orgId || !tokenValue) return;

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
          params: { id: orgId },
          data: { token: tokenValue },
        }
      );

      // Show success toast notification
      toast.success(
        t("join_organization_success") || "Successfully joined organization"
      );

      // Redirect to organizations list or dashboard
      router.push(`/organizations/${orgId}`);
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
  if (!orgId || !token) {
    return null;
  }

  // Authentication component for unauthenticated users
  const AuthenticationForm = () => (
    <div className="mt-4">
      <Tabs
        value={authTab}
        onValueChange={(value) => setAuthTab(value as "login" | "register")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">{t("login")}</TabsTrigger>
          <TabsTrigger value="register">{t("register")}</TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="mt-4">
          <LoginForm
            email={emailParam || ""}
            onSubmit={handleLogin}
            submitButtonText={t("login_and_accept_invitation")}
            loadingButtonText={t("logging_in")}
          />
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("dont_have_account")}{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setAuthTab("register")}
              >
                {t("sign_up")}
              </Button>
            </p>
          </div>
        </TabsContent>
        <TabsContent value="register" className="mt-4">
          <RegisterForm
            email={emailParam || undefined}
            onSubmit={handleRegister}
            submitButtonText={t("sign_up_and_accept_invitation")}
            loadingButtonText={t("creating_account")}
          />
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("already_have_account")}{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setAuthTab("login")}
              >
                {t("login")}
              </Button>
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

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
          ) : isError ? (
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
                      {organization?.name ||
                        searchParams.get("name") ||
                        t("organization")}
                    </h3>
                  </div>
                </div>
              </div>

              {!isLogged && !me.user ? (
                <AuthenticationForm />
              ) : (
                <>
                  <EmailVerificationAlert />
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
