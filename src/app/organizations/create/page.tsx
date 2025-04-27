"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import client from "@/lib/graphand-client";
import { useTranslation } from "@/lib/translation";
import { TermsModal } from "@/components/TermsModal";
import { useLatestTerms } from "@/hooks/use-latest-terms";
import GenericForm from "@/components/GenericForm";

// Organization creation schema
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
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export default function OrganizationsCreatePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { termsId } = useLatestTerms();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!termsId) {
        throw new Error("Terms ID not found");
      }

      // Create organization using Graphand client
      const organization = await client.model("organizations").create(
        {
          name: values.name,
          slug: values.slug,
        },
        {
          query: {
            consentTerms: termsId || "",
          },
        }
      );

      router.push(`/organizations/${organization._id}`);
    } catch (err) {
      // Error handling is now managed by the GenericForm component
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

  // Handle terms acceptance
  const handleAcceptTerms = () => {
    form.setValue("acceptTerms", true);
  };

  // Custom render for terms and conditions field
  const renderTermsField = (field: any) => (
    <div
      className={`flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ${
        form.formState.errors.acceptTerms ? "border-destructive" : ""
      }`}
    >
      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
      <div className="space-y-1 leading-none">
        <label>{t("acceptTermsAndConditions")}</label>
        <p className="text-sm text-muted-foreground">
          {t("iAccept")}{" "}
          <TermsModal
            trigger={
              <span className="text-primary underline cursor-pointer">
                {t("termsOfService")}
              </span>
            }
            onAccept={handleAcceptTerms}
          />
        </p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-10">
      <div className="text-3xl font-bold mb-6">{t("createOrganization")}</div>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">
            {t("createNewOrganization")}
          </CardTitle>
          <CardDescription>
            {t("createOrganizationDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenericForm
            form={form}
            onSubmit={onSubmit}
            fields={[
              {
                name: "name",
                label: t("name"),
                placeholder: t("organizationNamePlaceholder"),
                description: t("organizationNameDescription"),
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
                placeholder: t("organizationSlugPlaceholder"),
                description: t("organizationSlugDescription"),
                component: <Input />,
                mapServerErrors: ["slug"],
              },
              {
                name: "acceptTerms",
                label: t("acceptTermsAndConditions"),
                component: <Checkbox />,
                customRender: renderTermsField,
                mapServerErrors: [],
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
