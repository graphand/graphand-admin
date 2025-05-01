import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ColumnConfig } from "@/lib/hooks/useColumnManagement";

interface ColumnsState {
  // Store the column configurations by tableId (model name)
  tables: Record<string, ColumnConfig>;
  // Set or update a table's column configuration
  setTableColumns: (tableId: string, columns: ColumnConfig) => void;
  // Reset a specific table's configuration
  resetTableColumns: (tableId: string) => void;
  // Reset all stored configurations
  resetAllColumns: () => void;
}

export const useColumnsStore = create<ColumnsState>()(
  persist(
    (set) => ({
      tables: {},

      setTableColumns: (tableId, columns) =>
        set((state) => ({
          tables: {
            ...state.tables,
            [tableId]: columns,
          },
        })),

      resetTableColumns: (tableId) =>
        set((state) => {
          const newTables = { ...state.tables };
          delete newTables[tableId];
          return { tables: newTables };
        }),

      resetAllColumns: () => set({ tables: {} }),
    }),
    {
      name: "graphand-columns-storage",
      partialize: (state) => ({ tables: state.tables }),
    }
  )
);
