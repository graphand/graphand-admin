import React, { useState } from "react";
import {
  UseFormReturn,
  FieldValues,
  SubmitHandler,
  Path,
  ControllerRenderProps,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  ValidationError,
  ValidationValidatorError,
  ValidationPropertyError,
} from "@graphand/core";
import { ZodSchema } from "zod";
import { useTranslation } from "@/lib/translation";

export interface FormFieldConfig<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: string;
  component: React.ReactElement;
  customRender?: (
    field: ControllerRenderProps<T>,
    fieldConfig: FormFieldConfig<T>
  ) => React.ReactNode;
  mapServerErrors?: string[]; // Paths to map server errors to this field
}

export interface GenericFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  fields: FormFieldConfig<T>[];
  submitButtonText: string;
  loadingButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
  title?: string;
  description?: string;
  schema?: ZodSchema;
}

export default function GenericForm<T extends FieldValues>({
  form,
  onSubmit,
  fields,
  submitButtonText,
  loadingButtonText,
  cancelButtonText,
  onCancel,
}: GenericFormProps<T>) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: T) => {
    setIsLoading(true);
    setError(null);

    // Clear any previous field-specific errors
    form.clearErrors();

    try {
      await onSubmit(values);
    } catch (err) {
      console.error("Form submission error:", err);

      if (err instanceof ValidationError) {
        // Set field-specific errors using the ValidationError information
        const fieldPaths = err.propertiesPaths;
        let hasHandledFields = false;

        // Map errors to specific fields
        fields.forEach((field) => {
          if (field.mapServerErrors) {
            for (const errorPath of field.mapServerErrors) {
              if (err.onPath(errorPath).length) {
                let type = "";
                const error = err.onPath(errorPath)[0];
                if (error instanceof ValidationPropertyError) {
                  type = "invalid";
                } else if (error instanceof ValidationValidatorError) {
                  type = error.validator.type.toLowerCase();
                }
                form.setError(field.name, {
                  type: "server",
                  message: t(`validation.validators.${type}`, {
                    field: field.label.toLowerCase(),
                  }),
                });
                hasHandledFields = true;
                break; // Once we've set an error for this field, stop checking other paths
              }
            }
          }
        });

        // If there are validation errors but none match our mapped fields, show a generic error
        if (fieldPaths.length > 0 && !hasHandledFields) {
          setError("Validation failed: " + fieldPaths.join(", "));
        }
      } else {
        setError(err instanceof Error ? err.message : "Form submission failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = (
    fieldConfig: FormFieldConfig<T>,
    formField: ControllerRenderProps<T>
  ) => {
    if (fieldConfig.customRender) {
      return fieldConfig.customRender(formField, fieldConfig);
    }

    const InputComponent = React.cloneElement(fieldConfig.component, {
      ...formField,
      ...(fieldConfig.placeholder
        ? { placeholder: fieldConfig.placeholder }
        : {}),
      ...(fieldConfig.type ? { type: fieldConfig.type } : {}),
    });

    return InputComponent;
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>{renderFormField(field, formField)}</FormControl>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <div className="flex justify-end space-x-2 pt-4">
            {cancelButtonText && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                {cancelButtonText}
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  {loadingButtonText || submitButtonText}
                </>
              ) : (
                submitButtonText
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
