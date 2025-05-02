"use client";

import { useState, useEffect } from "react";
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
import client from "@/lib/graphand-client";
import RegisterForm, { RegisterFormValues } from "@/components/register-form";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const nextUrl = new URL(next, window.location.origin);
  const nextSearchParams = new URLSearchParams(nextUrl.search);
  const nextEmail = nextSearchParams.get("email");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Reset loading state if navigation failed
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isRedirecting) {
      // Set a safety timeout to reset loading state if navigation takes too long
      timeoutId = setTimeout(() => {
        setIsRedirecting(false);
      }, 5000); // 5 seconds timeout
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRedirecting]);

  // Handle form submission
  const onSubmit = async (values: RegisterFormValues) => {
    try {
      // Call the Graphand auth module to register
      await client.get("auth").register({
        configuration: {
          email: nextEmail || values.email,
          password: values.password,
        },
        account: {
          firstname: values.firstname,
          lastname: values.lastname,
        },
      });

      // Keep loading state true during redirection
      setIsRedirecting(true);
      router.push(next);
    } catch (err) {
      // Error handling is now managed by the GenericForm component
      throw err;
    }
  };

  const loginUrl = new URL("/auth/login", window.location.origin);
  loginUrl.search = searchParams.toString();

  return (
    <div className="container mx-auto flex flex-1 items-center justify-center m-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Create an Account
          </CardTitle>
          <CardDescription>
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm
            email={nextEmail || undefined}
            onSubmit={onSubmit}
            submitButtonText="Sign Up"
            loadingButtonText="Creating account..."
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            Already have an account?{" "}
            <Link
              href={loginUrl.toString()}
              className="font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
