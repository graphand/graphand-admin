"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import client from "@/lib/graphand-client";
import { ValidationError } from "@graphand/core";
import GenericForm from "@/components/GenericForm";

// Login form schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Call the Graphand auth module to login
      await client.get("auth").login({
        credentials: {
          email: values.email,
          password: values.password,
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
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenericForm
            form={form}
            onSubmit={onSubmit}
            fields={[
              {
                name: "email",
                label: "Email",
                placeholder: "your@email.com",
                component: <Input />,
                mapServerErrors: ["credentials.email"],
              },
              {
                name: "password",
                label: "Password",
                placeholder: "••••••••",
                type: "password",
                component: <Input />,
                mapServerErrors: ["credentials.password"],
              },
            ]}
            submitButtonText="Login"
            loadingButtonText="Please wait"
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
