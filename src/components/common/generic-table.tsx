import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  OnChangeFn,
  Column,
  VisibilityState,
  ColumnOrderState,
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
import { useColumnsStore } from "@/lib/store/columnsStore";

// Column configuration type that combines order and visibility
export type ColumnConfig = {
  id: string;
  visible: boolean;
  lockVisibility?: boolean;
}[];

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
  /** @deprecated Use lockVisibility in defaultColumns instead */
  primaryColumn?: string;
}

export function GenericTable<T extends typeof Model>({
  model,
  title,
  filter = {},
  defaultSort = [{ id: "_createdAt", desc: true }],
  columns,
  primaryColumn,
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

  // Connect to our Zustand store
  const { tables, setTableColumns, resetTableColumns } = useColumnsStore();
  const storedColumns = useMemo(() => tables[tableId], [tables, tableId]);

  // Derive column IDs from columns
  const allColumnIds = useMemo(
    () => columns.map((col) => col.id as string),
    [columns]
  );

  // Determine columns with locked visibility - either from primaryColumn or defaultColumns with lockVisibility
  const lockedColumns = useMemo(() => {
    const locked = new Set<string>();

    // Support legacy primaryColumn
    if (primaryColumn) {
      locked.add(primaryColumn);
    }

    // Add columns with lockVisibility from defaultColumns
    if (defaultColumns) {
      defaultColumns.forEach((col) => {
        if (col.lockVisibility) {
          locked.add(col.id);
        }
      });
    }

    return locked;
  }, [primaryColumn, defaultColumns]);

  // Initialize columnsConfig with priority:
  // 1. Stored columns from localStorage
  // 2. Default columns from props
  // 3. All columns visible
  const [columnsConfig, setColumnsConfig] = useState<ColumnConfig>(() => {
    // Use stored columns if available
    if (storedColumns) {
      // Make sure to update stored configuration with locked columns
      return storedColumns.map((col) => ({
        ...col,
        lockVisibility: lockedColumns.has(col.id) || col.lockVisibility,
        // Ensure locked columns are always visible
        visible: lockedColumns.has(col.id) ? true : col.visible,
      }));
    }

    // Use defaultColumns if provided
    if (defaultColumns) {
      // Get all column IDs for comparison
      const defaultColumnIds = new Set(defaultColumns.map((col) => col.id));
      const allIds = allColumnIds;

      // Find columns that exist in table but not in defaultColumns
      const missingColumns = allIds.filter((id) => !defaultColumnIds.has(id));

      // Add missing columns to the end with visible=false
      return [
        ...defaultColumns.map((col) => ({
          ...col,
          lockVisibility: lockedColumns.has(col.id) || col.lockVisibility,
          // Ensure locked columns are always visible
          visible: lockedColumns.has(col.id) ? true : col.visible,
        })),
        ...missingColumns.map((id) => ({
          id,
          visible: false,
          lockVisibility: lockedColumns.has(id),
        })),
      ];
    }

    // Create default config where all columns are visible and in their original order
    return allColumnIds.map((id) => ({
      id,
      visible: true,
      lockVisibility: lockedColumns.has(id),
    }));
  });

  // Sync columnsConfig with the store when it changes
  useEffect(() => {
    if (columnsConfig.length > 0) {
      setTableColumns(tableId, columnsConfig);

      // Call external onChange handler if provided
      if (onColumnsChange) {
        onColumnsChange(columnsConfig);
      }
    }
  }, [columnsConfig, setTableColumns, tableId, onColumnsChange]);

  // Handle resetting columns to default
  const handleResetColumns = useCallback(() => {
    // Reset the local store entry
    resetTableColumns(tableId);

    // Recreate the default config
    let newConfig: ColumnConfig;

    if (defaultColumns) {
      // Get all column IDs for comparison
      const defaultColumnIds = new Set(defaultColumns.map((col) => col.id));
      const allIds = allColumnIds;

      // Find columns that exist in table but not in defaultColumns
      const missingColumns = allIds.filter((id) => !defaultColumnIds.has(id));

      // Add missing columns to the end with visible=false
      newConfig = [
        ...defaultColumns.map((col) => ({
          ...col,
          lockVisibility: lockedColumns.has(col.id) || col.lockVisibility,
          // Ensure locked columns are always visible
          visible: lockedColumns.has(col.id) ? true : col.visible,
        })),
        ...missingColumns.map((id) => ({
          id,
          visible: false,
          lockVisibility: lockedColumns.has(id),
        })),
      ];
    } else {
      // All columns visible in original order
      newConfig = allColumnIds.map((id) => ({
        id,
        visible: true,
        lockVisibility: lockedColumns.has(id),
      }));
    }

    // Update local state
    setColumnsConfig(newConfig);
  }, [resetTableColumns, tableId, defaultColumns, allColumnIds, lockedColumns]);

  // Verify locked columns exist in columns - for backward compatibility
  useEffect(() => {
    const columnIds = columns.map((col) => col.id as string);
    lockedColumns.forEach((lockedId) => {
      if (!columnIds.includes(lockedId)) {
        console.warn(
          `Locked column "${lockedId}" not found in columns. This may cause issues.`
        );
      }
    });
  }, [columns, lockedColumns]);

  // Derive visibility state from columnsConfig
  const columnVisibility = useMemo<VisibilityState>(() => {
    const visibility: VisibilityState = {};
    columnsConfig.forEach((col) => {
      // Ensure locked columns are always visible
      visibility[col.id] = col.lockVisibility ? true : col.visible;
    });
    return visibility;
  }, [columnsConfig]);

  // Derive order state from columnsConfig
  const columnOrder = useMemo<ColumnOrderState>(() => {
    return columnsConfig.map((col) => col.id);
  }, [columnsConfig]);

  // Handle columnsConfig changes
  const updateColumnsConfig = useCallback((newConfig: ColumnConfig) => {
    setColumnsConfig(newConfig);
  }, []);

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

  // Handle column visibility change while ensuring locked columns stay visible
  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = useCallback(
    (updater) => {
      // Get the new visibility state
      const newVisibility =
        typeof updater === "function" ? updater(columnVisibility) : updater;

      // Ensure locked columns are always visible
      const safeVisibility = { ...newVisibility };
      columnsConfig.forEach((col) => {
        if (col.lockVisibility) {
          safeVisibility[col.id] = true;
        }
      });

      // Update the columnsConfig based on the new visibility
      updateColumnsConfig(
        columnsConfig.map((col) => ({
          ...col,
          visible: col.lockVisibility ? true : !!safeVisibility[col.id],
        }))
      );
    },
    [columnVisibility, columnsConfig, updateColumnsConfig]
  );

  // Handle column order change
  const handleColumnOrderChange: OnChangeFn<ColumnOrderState> = useCallback(
    (updaterOrValue) => {
      // Process the updater or value to get the new order
      const newOrder =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnOrder)
          : updaterOrValue;

      // Create a new columnsConfig with the updated order
      // while preserving visibility settings
      const columnPropsMap = columnsConfig.reduce((acc, col) => {
        acc[col.id] = {
          visible: col.visible,
          lockVisibility: col.lockVisibility,
        };
        return acc;
      }, {} as Record<string, { visible: boolean; lockVisibility?: boolean }>);

      const newColumnsConfig = newOrder.map((id) => ({
        id,
        visible: columnPropsMap[id]?.lockVisibility
          ? true
          : columnPropsMap[id]?.visible ?? true,
        lockVisibility: columnPropsMap[id]?.lockVisibility,
      }));

      updateColumnsConfig(newColumnsConfig);
    },
    [columnsConfig, updateColumnsConfig, columnOrder]
  );

  // Add any new columns that might have been added to the component
  useEffect(() => {
    const configuredIds = new Set(columnsConfig.map((col) => col.id));
    const newColumns = allColumnIds.filter((id) => !configuredIds.has(id));

    if (newColumns.length > 0) {
      setColumnsConfig((current) => [
        ...current,
        ...newColumns.map((id) => ({
          id,
          visible: true,
          lockVisibility: lockedColumns.has(id),
        })),
      ]);
    }
  }, [allColumnIds, columnsConfig, lockedColumns]);

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

  // Get the locked column IDs to pass to the menu
  const lockedColumnIds = useMemo(() => {
    return columnsConfig
      .filter((col) => col.lockVisibility)
      .map((col) => col.id);
  }, [columnsConfig]);

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
              {table.getAllLeafColumns().map((column) => (
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
  }: {
    column: Column<ModelInstance<typeof Model>, unknown>;
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
