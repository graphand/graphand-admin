import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslation } from "@/lib/translation";

// Form schema for inviting members
const inviteFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  transferOwnership: z.boolean().default(false),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface InviteMembersProps {
  onInvite: (data: { email: string; transferOwnership: boolean }) => void;
  isPending: boolean;
}

export function InviteMembers({ onInvite, isPending }: InviteMembersProps) {
  const { t } = useTranslation();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      transferOwnership: false,
    },
  });

  const onSubmit = (data: InviteFormValues) => {
    onInvite(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-end gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input placeholder="colleague@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending || !form.formState.isValid}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("inviting")}
              </>
            ) : (
              t("invite")
            )}
          </Button>
        </div>

        <FormField
          control={form.control}
          name="transferOwnership"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t("transferOwnership")}</FormLabel>
                <FormDescription>
                  {t("transferOwnershipDescription")}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
