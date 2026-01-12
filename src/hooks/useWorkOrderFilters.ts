import { useState, useMemo } from "react";
import { WorkOrder, WorkOrderFilters } from "@/types/workOrder";

const initialFilters: WorkOrderFilters = {
  search: "",
  status: [],
  priority: [],
  category: [],
  assignedTo: [],
  dateRange: { from: undefined, to: undefined },
  client: [],
};

export function useWorkOrderFilters(workOrders: WorkOrder[]) {
  const [filters, setFilters] = useState<WorkOrderFilters>(initialFilters);
  const [sortField, setSortField] = useState<keyof WorkOrder>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredWorkOrders = useMemo(() => {
    return workOrders
      .filter((wo) => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesSearch =
            wo.title.toLowerCase().includes(searchLower) ||
            wo.description.toLowerCase().includes(searchLower) ||
            wo.id.toLowerCase().includes(searchLower) ||
            wo.clientName.toLowerCase().includes(searchLower) ||
            wo.assignedTo.toLowerCase().includes(searchLower) ||
            wo.tags.some((tag) => tag.toLowerCase().includes(searchLower));
          if (!matchesSearch) return false;
        }

        // Status filter
        if (filters.status.length > 0 && !filters.status.includes(wo.status)) {
          return false;
        }

        // Priority filter
        if (filters.priority.length > 0 && !filters.priority.includes(wo.priority)) {
          return false;
        }

        // Category filter
        if (filters.category.length > 0 && !filters.category.includes(wo.category)) {
          return false;
        }

        // Assigned To filter
        if (filters.assignedTo.length > 0 && !filters.assignedTo.includes(wo.assignedTo)) {
          return false;
        }

        // Client filter
        if (filters.client.length > 0 && !filters.client.includes(wo.clientName)) {
          return false;
        }

        // Date range filter
        if (filters.dateRange.from && wo.dueDate < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange.to && wo.dueDate > filters.dateRange.to) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === "asc"
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
  }, [workOrders, filters, sortField, sortDirection]);

  const handleSort = (field: keyof WorkOrder) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    setFilters,
    filteredWorkOrders,
    sortField,
    sortDirection,
    handleSort,
    clearFilters,
  };
}
