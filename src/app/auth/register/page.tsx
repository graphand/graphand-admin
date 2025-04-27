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
import RegisterForm, { RegisterFormValues } from "@/components/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
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
          email: values.email,
          password: values.password,
        },
        account: {
          firstname: values.firstname,
          lastname: values.lastname,
        },
      });

      // Keep loading state true during redirection
      setIsRedirecting(true);
      router.refresh(); // Refresh to update server components
      router.push(callbackUrl);
    } catch (err) {
      // Error handling is now managed by the GenericForm component
      throw err;
    }
  };

  return (
    <div className="container mx-auto flex flex-1 items-center justify-center">
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
            onSubmit={onSubmit}
            submitButtonText="Sign Up"
            loadingButtonText="Creating account..."
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
