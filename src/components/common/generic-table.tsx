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
}

export function GenericTable<T extends typeof Model>({
  model,
  title,
  filter = {},
  defaultSort = [{ id: "_createdAt", desc: true }],
  columns,
  pageSize = 10,
  enableSorting = true,
  enableSubscription = true,
  emptyStateMessage,
  showCard = true,
}: GenericTableProps<T>) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();
  const [sorting, setSorting] = useState<SortingState>(defaultSort);
  const subscriptionsRef = useRef<Array<() => void>>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
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
        const unsubscribe = list.subscribe(() => {
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

  // When sorting changes, reset the data, cleanup subscriptions, and fetch with new sort
  useEffect(() => {
    if (data && enableSubscription) {
      cleanupSubscriptions();
      refetch();
    }
  }, [serverSort, refetch, data, cleanupSubscriptions, enableSubscription]);

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
    state: {
      sorting,
    },
    manualSorting: true,
    enableSorting,
  });

  // Reset table internal state when data changes via updateTrigger
  useEffect(() => {
    if (table) {
      table.resetRowSelection();
    }
  }, [updateTrigger, table]);

  const tableContent = (
    <>
      {items.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground">
          {emptyStateMessage || t("noItemsFound")}
        </p>
      ) : (
        <div className="rounded-md border">
          <Table key={updateTrigger}>
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
          <CardHeader>{title && <CardTitle>{title}</CardTitle>}</CardHeader>
          <CardContent>{tableContent}</CardContent>
        </Card>
      </div>
    );
  }

  return <div className="space-y-6">{tableContent}</div>;
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
