import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  WorkOrderFilters as Filters,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderCategory,
} from "@/types/workOrder";
import { assignees, clients } from "@/data/mockWorkOrders";

interface WorkOrderFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

const statusOptions: { value: WorkOrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "bg-warning/10 text-warning border-warning/20" },
  { value: "in-progress", label: "In Progress", color: "bg-primary/10 text-primary border-primary/20" },
  { value: "completed", label: "Completed", color: "bg-success/10 text-success border-success/20" },
  { value: "cancelled", label: "Cancelled", color: "bg-muted text-muted-foreground border-muted" },
  { value: "on-hold", label: "On Hold", color: "bg-destructive/10 text-destructive border-destructive/20" },
];

const priorityOptions: { value: WorkOrderPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-muted text-muted-foreground" },
  { value: "medium", label: "Medium", color: "bg-warning/10 text-warning" },
  { value: "high", label: "High", color: "bg-destructive/10 text-destructive" },
  { value: "urgent", label: "Urgent", color: "bg-destructive text-destructive-foreground" },
];

const categoryOptions: { value: WorkOrderCategory; label: string }[] = [
  { value: "maintenance", label: "Maintenance" },
  { value: "repair", label: "Repair" },
  { value: "installation", label: "Installation" },
  { value: "inspection", label: "Inspection" },
  { value: "other", label: "Other" },
];

export function WorkOrderFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: WorkOrderFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount =
    filters.status.length +
    filters.priority.length +
    filters.category.length +
    filters.assignedTo.length +
    filters.client.length +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0);

  const handleStatusChange = (status: WorkOrderStatus, checked: boolean) => {
    const newStatus = checked
      ? [...filters.status, status]
      : filters.status.filter((s) => s !== status);
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handlePriorityChange = (priority: WorkOrderPriority, checked: boolean) => {
    const newPriority = checked
      ? [...filters.priority, priority]
      : filters.priority.filter((p) => p !== priority);
    onFiltersChange({ ...filters, priority: newPriority });
  };

  const handleCategoryChange = (category: WorkOrderCategory, checked: boolean) => {
    const newCategory = checked
      ? [...filters.category, category]
      : filters.category.filter((c) => c !== category);
    onFiltersChange({ ...filters, category: newCategory });
  };

  const handleAssigneeChange = (assignee: string) => {
    const newAssignees = filters.assignedTo.includes(assignee)
      ? filters.assignedTo.filter((a) => a !== assignee)
      : [...filters.assignedTo, assignee];
    onFiltersChange({ ...filters, assignedTo: newAssignees });
  };

  const handleClientChange = (client: string) => {
    const newClients = filters.client.includes(client)
      ? filters.client.filter((c) => c !== client)
      : [...filters.client, client];
    onFiltersChange({ ...filters, client: newClients });
  };

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search work orders..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Quick Status Filter */}
        <Select
          value={filters.status.length === 1 ? filters.status[0] : "all"}
          onValueChange={(value) => {
            if (value === "all") {
              onFiltersChange({ ...filters, status: [] });
            } else {
              onFiltersChange({ ...filters, status: [value as WorkOrderStatus] });
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Quick Priority Filter */}
        <Select
          value={filters.priority.length === 1 ? filters.priority[0] : "all"}
          onValueChange={(value) => {
            if (value === "all") {
              onFiltersChange({ ...filters, priority: [] });
            } else {
              onFiltersChange({ ...filters, priority: [value as WorkOrderPriority] });
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorityOptions.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal",
                !filters.dateRange.from && !filters.dateRange.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd")} -{" "}
                    {format(filters.dateRange.to, "LLL dd")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y")
                )
              ) : (
                "Due Date Range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange.from}
              selected={{
                from: filters.dateRange.from,
                to: filters.dateRange.to,
              }}
              onSelect={(range) =>
                onFiltersChange({
                  ...filters,
                  dateRange: { from: range?.from, to: range?.to },
                })
              }
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Advanced Filters Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
              <SheetDescription>
                Filter work orders by multiple criteria
              </SheetDescription>
            </SheetHeader>

            <div className="py-6 space-y-6">
              {/* Status Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={filters.status.includes(status.value)}
                        onCheckedChange={(checked) =>
                          handleStatusChange(status.value, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`status-${status.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {status.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Priority Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Priority</Label>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions.map((priority) => (
                    <div key={priority.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority.value}`}
                        checked={filters.priority.includes(priority.value)}
                        onCheckedChange={(checked) =>
                          handlePriorityChange(priority.value, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`priority-${priority.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {priority.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Category Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Category</Label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.value}`}
                        checked={filters.category.includes(category.value)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category.value, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`category-${category.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Assigned To Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Assigned To</Label>
                <div className="space-y-2">
                  {assignees.map((assignee) => (
                    <div key={assignee} className="flex items-center space-x-2">
                      <Checkbox
                        id={`assignee-${assignee}`}
                        checked={filters.assignedTo.includes(assignee)}
                        onCheckedChange={() => handleAssigneeChange(assignee)}
                      />
                      <Label
                        htmlFor={`assignee-${assignee}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {assignee}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Client Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Client</Label>
                <div className="space-y-2">
                  {clients.map((client) => (
                    <div key={client} className="flex items-center space-x-2">
                      <Checkbox
                        id={`client-${client}`}
                        checked={filters.client.includes(client)}
                        onCheckedChange={() => handleClientChange(client)}
                      />
                      <Label
                        htmlFor={`client-${client}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {client}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onClearFilters();
                  setIsOpen(false);
                }}
              >
                Clear All
              </Button>
              <Button className="flex-1" onClick={() => setIsOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => handleStatusChange(status, false)}
            >
              {statusOptions.find((s) => s.value === status)?.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.priority.map((priority) => (
            <Badge
              key={priority}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => handlePriorityChange(priority, false)}
            >
              {priorityOptions.find((p) => p.value === priority)?.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.category.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => handleCategoryChange(category, false)}
            >
              {categoryOptions.find((c) => c.value === category)?.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.assignedTo.map((assignee) => (
            <Badge
              key={assignee}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => handleAssigneeChange(assignee)}
            >
              {assignee}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.client.map((client) => (
            <Badge
              key={client}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => handleClientChange(client)}
            >
              {client}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  dateRange: { from: undefined, to: undefined },
                })
              }
            >
              {filters.dateRange.from && format(filters.dateRange.from, "MMM d")}
              {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM d")}`}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
