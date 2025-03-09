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
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import client from "@/lib/graphand-client";
import RegisterForm, { RegisterFormValues } from "@/components/RegisterForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function JoinOrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId");
  const token = searchParams.get("token");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTokenField, setShowTokenField] = useState(false);
  const [tokenValue, setTokenValue] = useState(token || "");

  // Check if required parameters are present
  if (!organizationId || !token) {
    return (
      <div className="container mx-auto flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Invalid Invitation
            </CardTitle>
            <CardDescription>
              This invitation link appears to be invalid or incomplete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Missing required parameters. Please make sure you have a valid
                invitation link.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-center">
              <Link
                href="/auth/login"
                className="font-semibold hover:underline"
              >
                Go to login page
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
      setIsRedirecting(true);
      router.push("/auth/login?message=organization-joined");
    } catch (err) {
      console.error("Join organization error:", err);
      // If it's a regular error not caught by GenericForm, show it here
      if (!(err instanceof Error)) {
        setError("An unknown error occurred");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to join organization");
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
        <span>Advanced Options</span>
        {showTokenField ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      {showTokenField && (
        <div className="mt-2 border rounded-md p-3 bg-muted/40">
          <p className="text-xs text-muted-foreground mb-2">
            This field is pre-filled with your invitation token. You typically
            don't need to modify it.
          </p>
          <Input
            value={tokenValue}
            onChange={(e) => setTokenValue(e.target.value)}
            placeholder="Invitation token"
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
            Join Organization 🤝
          </CardTitle>
          <CardDescription>
            Complete your information to join the organization
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
            submitButtonText="Join Organization"
            loadingButtonText="Processing..."
            serverErrorMappings={{
              firstname: ["register.firstname"],
              lastname: ["register.lastname"],
              email: ["register.email"],
              password: ["register.password"],
            }}
            beforeFields={<TokenField />}
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
