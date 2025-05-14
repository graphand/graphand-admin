"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
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
import GenericForm from "@/components/generic-form";
import { useEmailStore } from "@/store/email-store";

// Login form schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const nextUrl = new URL(next, window.location.origin);
  const nextSearchParams = new URLSearchParams(nextUrl.search);
  const nextEmail = nextSearchParams.get("email");
  const setEmail = useEmailStore((state) => state.setEmail);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: nextEmail || "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Call the Graphand auth module to login
    await client.get("auth").login({
      credentials: {
        email: values.email,
        password: values.password,
      },
    });

    // Save email to the store
    setEmail(values.email);

    window.location.href = next;

    await new Promise((resolve) => setTimeout(resolve, 3000));
  };

  const registerUrl = new URL("/auth/register", window.location.origin);
  registerUrl.search = searchParams.toString();

  return (
    <div className="container mx-auto flex flex-1 items-center justify-center m-4">
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
                placeholder: nextEmail ? nextEmail : "your@email.com",
                component: <Input disabled={!!nextEmail} />,
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
            Don&apos;t have an account?{" "}
            <Link
              href={registerUrl.toString()}
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
