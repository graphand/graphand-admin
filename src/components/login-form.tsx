import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import GenericForm from "@/components/generic-form";
import { useEmailStore } from "@/store/email-store";

// Login form schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginFormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  email?: string;
  onSubmit: (values: LoginFormValues) => Promise<void>;
  submitButtonText?: string;
  loadingButtonText?: string;
}

export default function LoginForm({
  email,
  onSubmit,
  submitButtonText = "Login",
  loadingButtonText = "Please wait",
}: LoginFormProps) {
  const setEmail = useEmailStore((state) => state.setEmail);

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email || "",
      password: "",
    },
  });

  // Handle form submission
  const handleSubmit = async (values: LoginFormValues) => {
    try {
      // Call the onSubmit callback (for custom logic in parent component)
      await onSubmit(values);

      // Save email to the store
      setEmail(values.email);
    } catch (err) {
      // Error handling is managed by the GenericForm component
      throw err;
    }
  };

  return (
    <GenericForm
      form={form}
      onSubmit={handleSubmit}
      fields={[
        {
          name: "email",
          label: "Email",
          placeholder: email ? email : "your@email.com",
          component: <Input disabled={!!email} />,
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
      submitButtonText={submitButtonText}
      loadingButtonText={loadingButtonText}
    />
  );
}
