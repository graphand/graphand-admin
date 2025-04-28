import { useTranslation } from "@/lib/translation";
import client from "@/lib/graphand-client";
import { ModelInstance } from "@graphand/core";
import { format } from "date-fns";
import {
  createSortableHeader,
  GenericTable,
} from "@/components/common/generic-table";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { JobStatusPill } from "@/components/jobs/job-status-pill";
import { JobTypePill } from "@/components/jobs/job-type-pill";

interface JobsTabProps {
  projectId: string;
}

export function JobsTab({ projectId }: JobsTabProps) {
  const { t } = useTranslation();
  const model = client.model("jobs");

  const columns: ColumnDef<ModelInstance<typeof model>>[] = useMemo(
    () => [
      {
        accessorKey: "_type",
        header: createSortableHeader("_type", t("type")),
        cell: ({ row }) => {
          const type = row.getValue("_type") as string;
          return <JobTypePill type={type} />;
        },
      },
      {
        accessorKey: "_status",
        header: createSortableHeader("_status", t("status")),
        cell: ({ row }) => {
          const status = row.getValue("_status") as string;
          const startedAt = row.getValue("_startedAt") as
            | Date
            | null
            | undefined;

          return <JobStatusPill status={status} startedAt={startedAt} />;
        },
      },
      {
        accessorKey: "_createdAt",
        header: createSortableHeader("_createdAt", t("createdAt")),
        cell: ({ row }) => {
          const date = row.getValue("_createdAt") as string;
          return format(new Date(date), "PPp");
        },
      },
      {
        accessorKey: "_updatedAt",
        header: createSortableHeader("_updatedAt", t("updatedAt")),
        cell: ({ row }) => {
          const date = row.getValue("_updatedAt") as string;
          return format(new Date(date), "PPp");
        },
      },
      {
        accessorKey: "_startedAt",
        header: createSortableHeader("_startedAt", t("startedAt")),
        cell: ({ row }) => {
          const date = row.getValue("_startedAt") as string;
          return format(new Date(date), "PPp");
        },
      },
    ],
    [t]
  );

  const jobsFilter = {
    _refs: {
      $in: [`projects:${projectId}`],
    },
  };

  return (
    <GenericTable
      model={model}
      title={t("projectJobs")}
      columns={columns}
      filter={jobsFilter}
      defaultSort={[{ id: "_createdAt", desc: true }]}
      enableSorting
      enableSubscription
      emptyStateMessage={t("noJobsFound")}
    />
  );
}
