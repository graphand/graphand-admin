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
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/translation";
import client from "@/lib/graphand-client";
import { toast } from "sonner";
import { AuthProviders, controllerConfigureAuth } from "@graphand/core";
import { useEmailStore } from "@/store/email-store";

export default function ConfirmEmailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { email: storedEmail } = useEmailStore();

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!storedEmail) return;

    try {
      setIsResending(true);
      setError(null);

      // Request to resend verification email using Graphand client
      await client.execute(controllerConfigureAuth, {
        data: {
          provider: AuthProviders.LOCAL,
          configuration: {
            email: storedEmail,
            sendConfirmationEmail: true,
          },
        },
      });

      // Show success toast notification
      toast.success(
        t("verification_email_sent") ||
          "Verification email has been sent to your email address"
      );
    } catch (err) {
      console.error("Resend verification error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          t("verification_email_error") || "Failed to send verification email"
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  // Handle verify email
  const handleVerifyEmail = async () => {
    if (!token.trim()) return;

    try {
      setIsVerifying(true);
      setError(null);

      // Verify email with the code using Graphand client
      await client.execute(controllerConfigureAuth, {
        data: {
          provider: AuthProviders.LOCAL,
          configuration: {
            confirmEmailToken: token,
          },
        },
      });

      // Show success toast notification
      toast.success(
        t("email_verified_success") ||
          "Your email has been successfully verified"
      );

      // Redirect to profile page
      router.push("/profile");
    } catch (err) {
      console.error("Email verification error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("verification_code_error") || "Invalid verification code");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto flex flex-1 items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {t("confirm_email") || "Confirm Email"} ✉️
          </CardTitle>
          <CardDescription>
            {t("verify_email_description") ||
              "Verify your email address to ensure secure access to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                {t("enter_verification_code") ||
                  "Enter the verification code sent to your email"}
              </h3>
              <div className="flex space-x-2">
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={t("verification_code") || "Verification code"}
                  className="flex-1"
                />
                <Button
                  onClick={handleVerifyEmail}
                  disabled={isVerifying || !token.trim()}
                >
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("verify") || "Verify"
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

            {storedEmail && (
              <div className="pt-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {t("didnt_receive_code") ||
                    "Didn't receive the verification code?"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="flex items-center mx-auto"
                >
                  {isResending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {t("resend_verification_email") ||
                    "Resend Verification Email"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Link href="/profile">
            <Button variant="ghost">
              {t("back_to_profile") || "Back to Profile"}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
