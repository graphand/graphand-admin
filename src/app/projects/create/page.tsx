"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import client from "@/lib/graphand-client";
import { useTranslation } from "@/lib/translation";
import GenericForm from "@/components/GenericForm";
import { useOrganizations } from "@/hooks/use-organizations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

// Project creation schema
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .max(50, { message: "Slug must be less than 50 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  organization: z.string().min(1, { message: "Organization is required" }),
});

export default function CreateProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationIdParam = searchParams.get("organizationId");
  const { t } = useTranslation();
  const { organizations, isLoading: isLoadingOrganizations } =
    useOrganizations();

  // Use state to manage the selected organization
  const [selectedOrg, setSelectedOrg] = useState(organizationIdParam || "");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      organization: "",
    },
  });

  // Set the organization field value when selectedOrg changes or component mounts
  useEffect(() => {
    form.setValue("organization", selectedOrg);
  }, [selectedOrg, form]);

  // Update selectedOrg if organizationIdParam changes (e.g., from URL change)
  useEffect(() => {
    if (organizationIdParam) {
      setSelectedOrg(organizationIdParam);
    }
  }, [organizationIdParam]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!values.organization) {
        throw new Error("Organization ID is required");
      }

      // Create project using Graphand client
      const project = await client.model("projects").create({
        name: values.name,
        slug: values.slug,
        organization: values.organization,
      });

      router.push(`/projects/${project._id}`);
    } catch (err) {
      // Error handling is managed by the GenericForm component
      throw err;
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
  };

  // Update slug when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);

    // Only auto-generate slug if user hasn't manually edited it
    if (
      !form.getValues("slug") ||
      form.getValues("slug") ===
        generateSlug(form.getValues("name").slice(0, -1))
    ) {
      form.setValue("slug", generateSlug(name));
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="text-3xl font-bold mb-6">{t("createProject")}</div>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("createNewProject")}</CardTitle>
          <CardDescription>{t("createProjectDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <GenericForm
            form={form}
            onSubmit={onSubmit}
            fields={[
              {
                name: "organization",
                label: t("organization"),
                description: t("selectOrganization"),
                component: <Select />,
                customRender: (field) => (
                  <Select
                    onValueChange={(value) => {
                      setSelectedOrg(value);
                      field.onChange(value);
                    }}
                    value={selectedOrg}
                    disabled={isLoadingOrganizations}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("selectOrganization")} />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org._id!} value={org._id!}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ),
                mapServerErrors: ["organization"],
              },
              {
                name: "name",
                label: t("name"),
                placeholder: t("projectNamePlaceholder"),
                description: t("projectNameDescription"),
                component: <Input onChange={handleNameChange} />,
                customRender: (field, config) => (
                  <Input
                    {...field}
                    placeholder={config.placeholder}
                    onChange={handleNameChange}
                  />
                ),
                mapServerErrors: ["name"],
              },
              {
                name: "slug",
                label: t("slug"),
                placeholder: t("projectSlugPlaceholder"),
                description: t("projectSlugDescription"),
                component: <Input />,
                mapServerErrors: ["slug"],
              },
            ]}
            submitButtonText={t("create")}
            loadingButtonText={t("creating")}
            cancelButtonText={t("cancel")}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
