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
        id: "_id",
        accessorKey: "_id",
        header: createSortableHeader("_id", t("models.jobs.properties._id")),
        cell: ({ row }) => {
          const id = row.getValue("_id") as string;
          return (
            <pre className="text-xs truncate select-all">
              <code>{id}</code>
            </pre>
          );
        },
      },
      {
        id: "_type",
        accessorKey: "_type",
        header: createSortableHeader(
          "_type",
          t("models.jobs.properties._type")
        ),
        cell: ({ row }) => {
          const type = row.getValue("_type") as string;
          return <JobTypePill type={type} />;
        },
      },
      {
        id: "_status",
        accessorKey: "_status",
        header: createSortableHeader(
          "_status",
          t("models.jobs.properties._status")
        ),
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
        id: "_createdAt",
        accessorKey: "_createdAt",
        header: createSortableHeader(
          "_createdAt",
          t("models.jobs.properties._createdAt")
        ),
        cell: ({ row }) => {
          const date = row.getValue("_createdAt") as string;
          return format(new Date(date), "PPp");
        },
      },
      {
        id: "_updatedAt",
        accessorKey: "_updatedAt",
        header: createSortableHeader(
          "_updatedAt",
          t("models.jobs.properties._updatedAt")
        ),
        cell: ({ row }) => {
          const date = row.getValue("_updatedAt") as string;
          return format(new Date(date), "PPp");
        },
      },
      {
        id: "_startedAt",
        accessorKey: "_startedAt",
        header: createSortableHeader(
          "_startedAt",
          t("models.jobs.properties._startedAt")
        ),
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
      enableColumnCustomization
      title={t("projectJobs")}
      columns={columns}
      filter={jobsFilter}
      defaultSort={[{ id: "_createdAt", desc: true }]}
      enableSorting
      enableSubscription
      defaultColumns={[
        { id: "_id", visible: false },
        { id: "_type", visible: true },
        { id: "_status", visible: true, lockVisibility: true },
        { id: "_startedAt", visible: true },
        { id: "_createdAt", visible: true },
        { id: "_updatedAt", visible: true },
      ]}
      tableId="global-projects-jobs"
      emptyStateMessage={t("noJobsFound")}
    />
  );
}
