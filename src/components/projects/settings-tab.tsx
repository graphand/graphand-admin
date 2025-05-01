import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash, RefreshCw } from "lucide-react";
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
import { useTranslation } from "@/lib/translation";
import client from "@/lib/graphand-client";
import { controllerModelDelete } from "@graphand/core";
import Project from "@/lib/models/Project";
import { useInstance } from "@/hooks/use-instance";
import { useQueryClient } from "@tanstack/react-query";

interface SettingsTabProps {
  projectId: string;
}

export function SettingsTab({ projectId }: SettingsTabProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false);
  const [confirmProjectName, setConfirmProjectName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch project details
  const { data: project } = useInstance(client.model("projects"), projectId);

  const projectName = project?.name || "";

  const handleDeleteProject = async () => {
    if (confirmProjectName !== projectName) {
      setDeleteError(t("projectNameMismatch"));
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await client.execute(controllerModelDelete, {
        params: {
          model: Project.slug,
          id: projectId,
        },
      });

      await queryClient.invalidateQueries({
        queryKey: [Project.slug],
      });

      // Close dialog and redirect to projects list
      setIsDeleteDialogOpen(false);
      router.push(
        `/organizations/${project?.organization?._id}#archived-projects`
      );
    } catch (error) {
      console.error("Failed to delete project:", error);
      setDeleteError(
        error instanceof Error ? error.message : t("projectDeletionFailed")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestartProject = async () => {
    try {
      setIsRestarting(true);

      const res = await client.execute(
        {
          path: "/projects/:id/restart",
          methods: ["post"],
          secured: true,
        },
        {
          params: {
            id: projectId,
          },
        }
      );

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      await queryClient.invalidateQueries({
        queryKey: [Project.slug],
      });

      // Close dialog after simulating restart action
      setIsRestartDialogOpen(false);
    } catch (error) {
      console.error("Failed to restart project:", error);
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("projectSettings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("projectSettingsPlaceholder")}</p>
        </CardContent>
      </Card>

      {/* Project Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("projectActions") || "Project Actions"}</CardTitle>
          <CardDescription>
            {t("projectActionsDescription") ||
              "Actions you can perform on this project"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setIsRestartDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            {t("restartProject") || "Restart Project"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle size={18} />
            {t("dangerZone")}
          </CardTitle>
          <CardDescription>{t("dangerZoneDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t("deleteProjectWarning")}
          </p>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Trash size={16} />
            {t("deleteProject")}
          </Button>
        </CardContent>
      </Card>

      {/* Restart Project Confirmation Dialog */}
      <AlertDialog
        open={isRestartDialogOpen}
        onOpenChange={setIsRestartDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("restartProjectConfirmation") || "Restart Project"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("restartProjectConfirmationDescription") ||
                "Are you sure you want to restart this project? This may cause temporary service disruption."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestartProject}
              disabled={isRestarting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRestarting
                ? t("restarting") || "Restarting..."
                : t("restartProject") || "Restart Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteProjectConfirmation")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteProjectConfirmationDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <p className="text-sm font-medium mb-2">
              {t("typeProjectNameToConfirm", { projectName })}
            </p>
            <Input
              value={confirmProjectName}
              onChange={(e) => setConfirmProjectName(e.target.value)}
              placeholder={projectName}
              className="mb-2"
            />
            {deleteError && (
              <p className="text-sm text-destructive mt-2">{deleteError}</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting || confirmProjectName !== projectName}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? t("deleting") : t("deleteProject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
