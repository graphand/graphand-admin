"use client";

import { useTranslation } from "@/lib/translation";
import client from "@/lib/graphand-client";
import { ModelInstance } from "@graphand/core";
import { format } from "date-fns";
import { GenericTable } from "@/components/common/generic-table";
import { useMemo, useState } from "react";
import { Column, ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import GenericForm from "@/components/generic-form";

interface DataModelsTabProps {
  projectId: string;
}

// Form schema for creating a data model
const createModelSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  name: z.string().min(1, "Name is required"),
});

export function DataModelsTab({ projectId }: DataModelsTabProps) {
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelInstance<
    typeof model
  > | null>(null);
  // We'll use the models model to fetch schemas for this project
  const model = client.model("datamodels");
  console.log(projectId);

  // Create form
  const form = useForm<z.infer<typeof createModelSchema>>({
    resolver: zodResolver(createModelSchema),
    defaultValues: {
      slug: "",
      name: "",
    },
  });

  // Update form
  const updateForm = useForm<z.infer<typeof createModelSchema>>({
    resolver: zodResolver(createModelSchema),
    defaultValues: {
      slug: "",
      name: "",
    },
  });

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

  // Handle update name change
  const handleUpdateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    updateForm.setValue("name", name);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof createModelSchema>) => {
    try {
      await model.create({
        slug: values.slug,
        name: values.name,
      });

      // Reset form and close modal
      form.reset();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create data model:", error);
      throw error; // Let GenericForm handle the error
    }
  };

  // Handle update submission
  const onUpdate = async (values: z.infer<typeof createModelSchema>) => {
    if (!selectedModel) return;

    try {
      await selectedModel.update({
        $set: {
          name: values.name,
        },
      });

      // Reset form and close modal
      updateForm.reset();
      setIsUpdateModalOpen(false);
      setSelectedModel(null);
    } catch (error) {
      console.error("Failed to update data model:", error);
      throw error; // Let GenericForm handle the error
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedModel) return;

    try {
      await selectedModel.delete();
      setIsDeleteDialogOpen(false);
      setSelectedModel(null);
    } catch (error) {
      console.error("Failed to delete data model:", error);
    }
  };

  // Open update modal
  const openUpdateModal = (dataModel: ModelInstance<typeof model>) => {
    setSelectedModel(dataModel);
    updateForm.setValue("slug", dataModel.get("slug") || "");
    updateForm.setValue("name", dataModel.get("name") || "");
    setIsUpdateModalOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (dataModel: ModelInstance<typeof model>) => {
    setSelectedModel(dataModel);
    setIsDeleteDialogOpen(true);
  };

  // Create a custom sortable header for DataModelType
  function createDataModelSortableHeader(columnId: string, label: string) {
    const SortableHeader = ({
      column,
    }: {
      column: Column<ModelInstance<typeof model>, unknown>;
    }) => {
      return (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {label}
          {column.getIsSorted() ? (
            column.getIsSorted() === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )
          ) : (
            <ArrowUpDown className="h-4 w-4" />
          )}
        </button>
      );
    };

    SortableHeader.displayName = `SortableHeader_${columnId}`;
    return SortableHeader;
  }

  const columns: ColumnDef<ModelInstance<typeof model>>[] = useMemo(
    () => [
      {
        accessorKey: "slug",
        header: createDataModelSortableHeader("slug", t("name")),
        cell: ({ row }) => {
          const slug = row.getValue("slug") as string;
          return <span className="font-medium">{slug}</span>;
        },
      },
      {
        accessorKey: "name",
        header: createDataModelSortableHeader("name", t("name")),
        cell: ({ row }) => {
          const name = row.getValue("name") as string;
          return <span className="font-medium">{name}</span>;
        },
      },
      {
        accessorKey: "_createdAt",
        header: createDataModelSortableHeader("_createdAt", t("createdAt")),
        cell: ({ row }) => {
          const date = row.getValue("_createdAt") as string;
          return format(new Date(date), "PPp");
        },
      },
      {
        accessorKey: "_updatedAt",
        header: createDataModelSortableHeader("_updatedAt", t("updatedAt")),
        cell: ({ row }) => {
          const date = row.getValue("_updatedAt") as string;
          if (!date) return null;
          return format(new Date(date), "PPp");
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const dataModel = row.original;
          return (
            <div className="flex space-x-2 justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openUpdateModal(dataModel)}
                title={t("update")}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openDeleteDialog(dataModel)}
                title={t("delete")}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [t]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{t("dataModels")}</CardTitle>
              </div>
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                {t("createModel")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <GenericTable
              model={model}
              columns={columns}
              defaultSort={[{ id: "_createdAt", desc: true }]}
              enableSorting
              enableSubscription
              emptyStateMessage={t("noModelsFound")}
              showCard={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Create Model Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("createNewModel")}</DialogTitle>
            <DialogDescription>
              {t("createNewModelDescription")}
            </DialogDescription>
          </DialogHeader>

          <GenericForm
            form={form}
            onSubmit={onSubmit}
            fields={[
              {
                name: "name",
                label: t("modelName") || "Model Name",
                component: <Input autoFocus />,
                customRender: (field, config) => (
                  <Input
                    {...field}
                    placeholder={config.placeholder}
                    autoFocus
                    onChange={handleNameChange}
                  />
                ),
                mapServerErrors: ["name"],
              },
              {
                name: "slug",
                label: t("modelSlug") || "Model Slug",
                description:
                  t("modelSlugDescription") ||
                  "Unique identifier for the model (e.g. products, users, etc.)",
                component: <Input />,
                mapServerErrors: ["slug"],
              },
            ]}
            submitButtonText={t("create") || "Create"}
            loadingButtonText={t("creating") || "Creating..."}
            cancelButtonText={t("cancel") || "Cancel"}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Update Model Dialog */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("updateModel")}</DialogTitle>
            <DialogDescription>{t("updateModelDescription")}</DialogDescription>
          </DialogHeader>

          <GenericForm
            form={updateForm}
            onSubmit={onUpdate}
            fields={[
              {
                name: "name",
                label: t("modelName") || "Model Name",
                description:
                  t("modelNameDescription") || "Display name for the model",
                component: <Input autoFocus />,
                customRender: (field, config) => (
                  <Input
                    {...field}
                    placeholder={config.placeholder}
                    autoFocus
                    onChange={handleUpdateNameChange}
                  />
                ),
                mapServerErrors: ["name"],
              },
              {
                name: "slug",
                label: t("modelSlug") || "Model Slug",
                description:
                  t("modelSlugDescription") ||
                  "Unique identifier for the model (cannot be changed)",
                component: <Input disabled />,
                mapServerErrors: ["slug"],
              },
            ]}
            submitButtonText={t("update") || "Update"}
            loadingButtonText={t("updating") || "Updating..."}
            cancelButtonText={t("cancel") || "Cancel"}
            onCancel={() => setIsUpdateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteModel")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteModelConfirmation", {
                model: selectedModel?.get("name") || selectedModel?.get("slug"),
              }) ||
                "Are you sure you want to delete this model? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
