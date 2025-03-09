"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translation";
import { useMe } from "@/hooks/use-me";
import GenericForm from "@/components/GenericForm";
import client from "@/lib/graphand-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

// Profile form schema
const formSchema = z.object({
  firstname: z.string().min(1, { message: "First name is required" }),
  lastname: z.string().min(1, { message: "Last name is required" }),
});

export default function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoading, refetch } = useMe();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: (user?.get("firstname") as string) || "",
      lastname: (user?.get("lastname") as string) || "",
    },
    values: {
      firstname: (user?.get("firstname") as string) || "",
      lastname: (user?.get("lastname") as string) || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Update user profile using Graphand client
    await user?.update({
      $set: {
        firstname: values.firstname,
        lastname: values.lastname,
      },
    });

    // Refresh the user data
    await refetch();

    // Redirect to profile page
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>{t("userInformation")}</CardTitle>
            <CardDescription>{t("not_logged_in")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const userInitials = user.getInitials();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={(user.get("avatarUrl") as string) || ""} />
          <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.getFullname()}</h1>
          <p className="text-muted-foreground">
            {(user.get("email") as string) || ""}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("userInformation")}</CardTitle>
            <CardDescription>{t("personalInformation")}</CardDescription>
          </CardHeader>
          <CardContent>
            <GenericForm
              form={form}
              onSubmit={onSubmit}
              fields={[
                {
                  name: "firstname",
                  label: t("firstName") || "First Name",
                  component: <Input />,
                  mapServerErrors: ["firstname"],
                },
                {
                  name: "lastname",
                  label: t("lastName") || "Last Name",
                  component: <Input />,
                  mapServerErrors: ["lastname"],
                },
              ]}
              submitButtonText={t("save") || "Save"}
              loadingButtonText={t("saving") || "Saving..."}
              cancelButtonText={t("cancel")}
              onCancel={() => router.back()}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("accountSettings")}</CardTitle>
            <CardDescription>{t("manageAccountPreferences")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{t("userId")}</h3>
                <p className="text-muted-foreground mt-1">{user._id}</p>
              </div>

              <div>
                <h3 className="font-medium">{t("accountCreated")}</h3>
                <p className="text-muted-foreground mt-1">
                  {user._createdAt?.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
