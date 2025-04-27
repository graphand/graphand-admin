"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import GenericForm, { FormFieldConfig } from "@/components/GenericForm";

// Registration form schema
export const registerFormSchema = z.object({
  firstname: z.string().min(1, { message: "First name is required" }),
  lastname: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  submitButtonText?: string;
  loadingButtonText?: string;
  serverErrorMappings?: {
    firstname: string[];
    lastname: string[];
    email: string[];
    password: string[];
  };
  defaultValues?: Partial<RegisterFormValues>;
  beforeFields?: React.ReactNode;
  afterFields?: React.ReactNode;
  // Allow for extending the schema with additional fields
  extendedSchema?: typeof registerFormSchema;
  // Allow for additional field configurations
  additionalFields?: FormFieldConfig<RegisterFormValues>[];
}

export default function RegisterForm({
  onSubmit,
  submitButtonText = "Sign Up",
  loadingButtonText = "Creating account...",
  serverErrorMappings = {
    firstname: ["account.firstname"],
    lastname: ["account.lastname"],
    email: ["configuration.email"],
    password: ["configuration.password"],
  },
  defaultValues = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  },
  beforeFields,
  afterFields,
  extendedSchema,
  additionalFields = [],
}: RegisterFormProps) {
  // Initialize form
  const schema = extendedSchema || registerFormSchema;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Create fields configuration
  const standardFields: FormFieldConfig<RegisterFormValues>[] = [
    {
      name: "firstname",
      label: "First Name",
      placeholder: "John",
      component: <Input />,
      mapServerErrors: serverErrorMappings.firstname,
    },
    {
      name: "lastname",
      label: "Last Name",
      placeholder: "Doe",
      component: <Input />,
      mapServerErrors: serverErrorMappings.lastname,
    },
    {
      name: "email",
      label: "Email",
      placeholder: "your@email.com",
      component: <Input />,
      mapServerErrors: serverErrorMappings.email,
    },
    {
      name: "password",
      label: "Password",
      placeholder: "••••••••",
      type: "password",
      component: <Input />,
      mapServerErrors: serverErrorMappings.password,
    },
  ];

  // Combine standard fields with any additional fields
  const fields = [...standardFields, ...additionalFields];

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      await onSubmit(values);
    } catch (err) {
      // Error handling is now managed by the GenericForm component
      throw err;
    }
  };

  return (
    <>
      {beforeFields}
      <GenericForm
        form={form}
        onSubmit={handleSubmit}
        fields={fields}
        submitButtonText={submitButtonText}
        loadingButtonText={loadingButtonText}
      />
      {afterFields}
    </>
  );
}
