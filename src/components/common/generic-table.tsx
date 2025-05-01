import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  OnChangeFn,
  Column,
} from "@tanstack/react-table";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/translation";
import { Filter, ModelInstance, Sort, Model } from "@graphand/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { ColumnCustomizationMenu } from "./ColumnCustomizationMenu";
import {
  ColumnConfig,
  useColumnManagement,
} from "@/lib/hooks/useColumnManagement";

interface GenericTableProps<T extends typeof Model> {
  model: T;
  title?: string;
  filter?: Filter;
  defaultSort?: SortingState;
  columns: ColumnDef<ModelInstance<T>>[];
  pageSize?: number;
  enableSorting?: boolean;
  enableSubscription?: boolean;
  emptyStateMessage?: string;
  showCard?: boolean;
  defaultColumn?: Partial<ColumnDef<ModelInstance<T>>>;
  enableColumnCustomization?: boolean;
  defaultColumns?: ColumnConfig;
  onColumnsChange?: (columns: ColumnConfig) => void;
  tableId?: string;
}

export function GenericTable<T extends typeof Model>({
  model,
  title,
  filter = {},
  defaultSort = [{ id: "_createdAt", desc: true }],
  columns,
  pageSize = 5,
  enableSorting = true,
  enableSubscription = true,
  emptyStateMessage,
  showCard = true,
  defaultColumn,
  enableColumnCustomization = false,
  defaultColumns,
  onColumnsChange,
  tableId = model.slug,
}: GenericTableProps<T>) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();
  const [sorting, setSorting] = useState<SortingState>(defaultSort);
  const subscriptionsRef = useRef<Array<() => void>>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Derive column IDs from columns
  const allColumnIds = useMemo(
    () => columns.map((col) => col.id as string),
    [columns]
  );

  // Determine columns with locked visibility
  const lockedColumnIds = useMemo(() => {
    const locked = new Set<string>();

    // Add columns with lockVisibility from defaultColumns
    if (defaultColumns) {
      defaultColumns.forEach((col) => {
        if (col.lockVisibility) {
          locked.add(col.id);
        }
      });
    }

    return Array.from(locked);
  }, [defaultColumns]);

  // Use the column management hook
  const {
    columnVisibility,
    columnOrder,
    handleColumnVisibilityChange,
    handleColumnOrderChange,
    handleResetColumns,
  } = useColumnManagement({
    tableId,
    allColumnIds,
    lockedColumnIds,
    defaultColumns,
    onColumnsChange,
  });

  // Verify locked columns exist in columns - for backward compatibility
  useEffect(() => {
    const columnIds = columns.map((col) => col.id as string);
    lockedColumnIds.forEach((lockedId) => {
      if (!columnIds.includes(lockedId)) {
        console.warn(
          `Locked column "${lockedId}" not found in columns. This may cause issues.`
        );
      }
    });
  }, [columns, lockedColumnIds]);

  // Convert Tanstack sorting state to Graphand sort object
  const getServerSideSort = useCallback((sortingState: SortingState): Sort => {
    if (!sortingState?.length) {
      return { _createdAt: -1 };
    }

    const [firstSort] = sortingState;
    const sortField = firstSort.id;
    const sortDirection = firstSort.desc ? -1 : 1;

    return {
      [sortField]: sortDirection,
    };
  }, []);

  const serverSort = useMemo(
    () => getServerSideSort(sorting),
    [sorting, getServerSideSort]
  );

  // Helper to cleanup all subscriptions
  const cleanupSubscriptions = useCallback(() => {
    subscriptionsRef.current.forEach((unsub) => unsub());
    subscriptionsRef.current = [];
  }, []);

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [model.slug, filter, serverSort],
      queryFn: async ({ pageParam = 0 }) => {
        const list = await model.getList({
          filter,
          sort: serverSort,
          pageSize,
          page: pageParam + 1,
        });

        // Add this page's subscription to our array if enabled
        if (enableSubscription) {
          const unsubscribe = list.subscribe((e) => {
            console.log("update trigger", e);
            // Force a re-render when any page's data is updated
            setUpdateTrigger((prev) => prev + 1);
          });

          subscriptionsRef.current.push(unsubscribe);
        }

        return list;
      },
      getNextPageParam: (lastPage, pages) => {
        const totalFetched = pages.length * pageSize;
        return totalFetched < lastPage.count ? lastPage.query.page : undefined;
      },
      initialPageParam: 0,
    });

  // Cleanup subscriptions on component unmount
  useEffect(() => {
    return () => {
      if (enableSubscription) {
        cleanupSubscriptions();
      }
    };
  }, [cleanupSubscriptions, enableSubscription]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = useMemo(() => {
    return data?.pages.flatMap((page) => page) || [];
  }, [data, updateTrigger]);

  // Handle sorting change
  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updatedSorting) => {
      setSorting(
        typeof updatedSorting === "function"
          ? updatedSorting(sorting)
          : updatedSorting
      );
    },
    [sorting]
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnOrderChange: handleColumnOrderChange,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
    },
    manualSorting: true,
    enableSorting,
    enableColumnResizing: true,
    defaultColumn: defaultColumn ?? { size: 150, minSize: 80, maxSize: 400 },
  });

  // Reset table internal state when data changes via updateTrigger
  useEffect(() => {
    if (table) {
      table.resetRowSelection();
    }
  }, [updateTrigger, table]);

  const tableColumns = table.getAllColumns() as unknown as Column<
    ModelInstance,
    unknown
  >[];

  const columnCustomizationControl = enableColumnCustomization && (
    <ColumnCustomizationMenu
      columns={tableColumns}
      onOrderChange={handleColumnOrderChange}
      lockedColumnIds={lockedColumnIds}
      currentColumnOrder={columnOrder}
      onReset={handleResetColumns}
      tableId={tableId}
    />
  );

  const tableContent = (
    <>
      {items.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground">
          {emptyStateMessage || t("noItemsFound")}
        </p>
      ) : (
        <div className="rounded-md border">
          <Table key={updateTrigger} className="table-fixed w-full">
            <colgroup>
              {table.getVisibleLeafColumns().map((column) => (
                <col key={column.id} style={{ width: column.getSize() }} />
              ))}
            </colgroup>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {hasNextPage && (
            <div ref={ref} className="flex justify-center p-4">
              {isFetchingNextPage && (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="text-sm text-muted-foreground">
                    {t("loadingMore")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {showCard ? (
          <Card>
            <CardHeader>{title && <CardTitle>{title}</CardTitle>}</CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (showCard) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            {title && <CardTitle>{title}</CardTitle>}
            {enableColumnCustomization && columnCustomizationControl}
          </CardHeader>
          <CardContent>{tableContent}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {enableColumnCustomization && (
        <div className="flex justify-end mb-4">
          {columnCustomizationControl}
        </div>
      )}
      {tableContent}
    </div>
  );
}

export function createSortableHeader(columnId: string, label: string) {
  const SortableHeader = ({
    column,
    hideControls = false,
  }: {
    column: Column<ModelInstance<typeof Model>, unknown>;
    hideControls?: boolean;
  }) => {
    if (hideControls) {
      return label;
    }

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
