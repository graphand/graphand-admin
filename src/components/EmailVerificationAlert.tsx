"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/use-me";
import { useTranslation } from "@/lib/translation";

export default function EmailVerificationAlert() {
  const { user } = useMe();
  const { t } = useTranslation();
  const router = useRouter();

  if (!user || user?.get("_email")) return null;

  return (
    <Alert className="mb-6 flex items-center" variant="warning">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between flex-1">
        <span>
          {t("email_not_verified") ||
            "Your email address has not been verified yet. Please verify your email to access all features."}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="ml-2 flex items-center"
          onClick={() => router.push("/public/confirm-email")}
        >
          <Mail className="mr-2 h-4 w-4" />
          {t("verify_email") || "Verify Email"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
