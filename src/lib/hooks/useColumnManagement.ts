import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ColumnOrderState,
  OnChangeFn,
  VisibilityState,
} from "@tanstack/react-table";
import { useColumnsStore } from "@/lib/store/columnsStore";

export type ColumnConfig = {
  id: string;
  visible: boolean;
  lockVisibility?: boolean;
}[];

interface UseColumnManagementProps {
  tableId: string;
  allColumnIds: string[];
  lockedColumnIds?: string[];
  defaultColumns?: ColumnConfig;
  onColumnsChange?: (columns: ColumnConfig) => void;
}

export function useColumnManagement({
  tableId,
  allColumnIds,
  lockedColumnIds = [],
  defaultColumns,
  onColumnsChange,
}: UseColumnManagementProps) {
  const { tables, setTableColumns, resetTableColumns } = useColumnsStore();
  const storedColumns = useMemo<ColumnConfig | null>(
    () => tables[tableId],
    [tables, tableId]
  );

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
        lockVisibility: lockedColumnIds.includes(col.id) || col.lockVisibility,
        // Ensure locked columns are always visible
        visible: lockedColumnIds.includes(col.id) ? true : col.visible,
      }));
    }

    // Use defaultColumns if provided
    if (defaultColumns) {
      // Get all column IDs for comparison
      const defaultColumnIds = new Set(defaultColumns.map((col) => col.id));

      // Find columns that exist in table but not in defaultColumns
      const missingColumns = allColumnIds.filter(
        (id) => !defaultColumnIds.has(id)
      );

      // Add missing columns to the end with visible=false
      return [
        ...defaultColumns.map((col) => ({
          ...col,
          lockVisibility:
            lockedColumnIds.includes(col.id) || col.lockVisibility,
          // Ensure locked columns are always visible
          visible: lockedColumnIds.includes(col.id) ? true : col.visible,
        })),
        ...missingColumns.map((id) => ({
          id,
          visible: false,
          lockVisibility: lockedColumnIds.includes(id),
        })),
      ];
    }

    // Create default config where all columns are visible and in their original order
    return allColumnIds.map((id) => ({
      id,
      visible: true,
      lockVisibility: lockedColumnIds.includes(id),
    }));
  });

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
  const columnOrder = useMemo<ColumnOrderState>(
    () => columnsConfig.map((col) => col.id),
    [columnsConfig]
  );

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
          lockVisibility: lockedColumnIds.includes(id),
        })),
      ]);
    }
  }, [allColumnIds, columnsConfig, lockedColumnIds]);

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
      setColumnsConfig(
        columnsConfig.map((col) => ({
          ...col,
          visible: col.lockVisibility ? true : !!safeVisibility[col.id],
        }))
      );
    },
    [columnVisibility, columnsConfig]
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

      setColumnsConfig(newColumnsConfig);
    },
    [columnsConfig, columnOrder]
  );

  // Handle resetting columns to default
  const handleResetColumns = useCallback(() => {
    // Reset the local store entry
    resetTableColumns(tableId);

    // Recreate the default config
    let newConfig: ColumnConfig;

    if (defaultColumns) {
      // Get all column IDs for comparison
      const defaultColumnIds = new Set(defaultColumns.map((col) => col.id));

      // Find columns that exist in table but not in defaultColumns
      const missingColumns = allColumnIds.filter(
        (id) => !defaultColumnIds.has(id)
      );

      // Add missing columns to the end with visible=false
      newConfig = [
        ...defaultColumns.map((col) => ({
          ...col,
          lockVisibility:
            lockedColumnIds.includes(col.id) || col.lockVisibility,
          // Ensure locked columns are always visible
          visible: lockedColumnIds.includes(col.id) ? true : col.visible,
        })),
        ...missingColumns.map((id) => ({
          id,
          visible: false,
          lockVisibility: lockedColumnIds.includes(id),
        })),
      ];
    } else {
      // All columns visible in original order
      newConfig = allColumnIds.map((id) => ({
        id,
        visible: true,
        lockVisibility: lockedColumnIds.includes(id),
      }));
    }

    // Update local state
    setColumnsConfig(newConfig);
  }, [
    resetTableColumns,
    tableId,
    defaultColumns,
    allColumnIds,
    lockedColumnIds,
  ]);

  return {
    columnsConfig,
    columnVisibility,
    columnOrder,
    handleColumnVisibilityChange,
    handleColumnOrderChange,
    handleResetColumns,
  };
}
