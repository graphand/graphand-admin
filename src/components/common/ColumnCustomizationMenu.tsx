import React, { useEffect, useState, useMemo } from "react";
import { Column, OnChangeFn, ColumnOrderState } from "@tanstack/react-table";
import { ModelInstance } from "@graphand/core";
import { useTranslation } from "@/lib/translation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Settings,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  RotateCcwIcon,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface SortableColumnItemProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  isLocked?: boolean;
}

function SortableColumnItem({
  id,
  label,
  checked,
  onCheckedChange,
  isLocked = false,
}: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent/50",
        isDragging && "opacity-70 bg-accent"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none"
        onMouseDown={(e) => {
          e.preventDefault();
          if (listeners?.onMouseDown) {
            listeners.onMouseDown(e);
          }
        }}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
      <div
        className={cn(
          "flex items-center flex-1",
          isLocked ? "cursor-not-allowed" : "cursor-pointer"
        )}
        onClick={() => !isLocked && onCheckedChange(!checked)}
      >
        {isLocked ? (
          <LockIcon className="h-4 w-4 mr-2 text-primary" />
        ) : checked ? (
          <EyeIcon className="h-4 w-4 mr-2 text-primary" />
        ) : (
          <EyeOffIcon className="h-4 w-4 mr-2 text-muted-foreground" />
        )}
        <span
          className={cn(
            "flex-1",
            !checked && !isLocked && "text-muted-foreground"
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// Make this component accept any type of columns
interface ColumnCustomizationMenuProps {
  columns: Column<ModelInstance, unknown>[];
  onOrderChange: OnChangeFn<ColumnOrderState>;
  lockedColumnIds: string[];
  currentColumnOrder: ColumnOrderState;
  onReset: () => void;
  tableId?: string; // Made optional to avoid linter error
}

export function ColumnCustomizationMenu({
  columns,
  onOrderChange,
  lockedColumnIds,
  currentColumnOrder,
  onReset,
}: ColumnCustomizationMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [columnItems, setColumnItems] = useState<
    { id: string; label: string }[]
  >([]);

  // Create a map for quick lookup of column objects by ID
  const columnsMap = useMemo(() => {
    const map = new Map<string, Column<ModelInstance, unknown>>();
    columns.forEach((column) => {
      map.set(column.id, column);
    });
    return map;
  }, [columns]);

  // Initialize columnItems based on currentColumnOrder
  useEffect(() => {
    // Create items in the current order with proper labels
    const orderedItems = currentColumnOrder.map((id) => {
      // Format the label from column ID
      return {
        id,
        label:
          id.charAt(0).toUpperCase() +
          id
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim(),
      };
    });

    setColumnItems(orderedItems);
  }, [currentColumnOrder, columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumnItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Apply the new order immediately using the tanstack onChange API
        const newOrder = newItems.map((item) => item.id);
        onOrderChange(newOrder);

        return newItems;
      });
    }
  };

  const getColumnById = (id: string) => {
    return columnsMap.get(id);
  };

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    // Don't allow toggling locked columns
    if (lockedColumnIds.includes(id)) return;

    const column = getColumnById(id);
    if (column) {
      column.toggleVisibility(isVisible);
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      // Close the dropdown after reset
      setOpen(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          {t("columns")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="mb-1">
          {t("customizeColumns")}
        </DropdownMenuLabel>
        <p className="text-xs text-muted-foreground px-2 pb-2">
          {t("dragAndToggleColumnsHint")}
        </p>
        <DropdownMenuSeparator />
        <div className="max-h-[60vh] overflow-y-auto px-1 py-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columnItems}
              strategy={verticalListSortingStrategy}
            >
              {columnItems.map((item) => {
                const column = getColumnById(item.id);
                const isLocked = lockedColumnIds.includes(item.id);

                return (
                  <SortableColumnItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    checked={(isLocked || column?.getIsVisible()) ?? true}
                    onCheckedChange={(checked) =>
                      handleToggleVisibility(item.id, checked)
                    }
                    isLocked={isLocked}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
        <DropdownMenuSeparator />
        <div className="flex justify-end py-2 px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            <RotateCcwIcon className="h-3 w-3 mr-1" />
            {t("resetColumns")}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
