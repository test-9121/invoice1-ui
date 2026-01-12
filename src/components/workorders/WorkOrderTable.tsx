import { format } from "date-fns";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { WorkOrder } from "@/types/workOrder";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  sortField: keyof WorkOrder;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof WorkOrder) => void;
}

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  "in-progress": "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-muted text-muted-foreground border-muted",
  "on-hold": "bg-destructive/10 text-destructive border-destructive/20",
};

const priorityStyles = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
  urgent: "bg-destructive text-destructive-foreground",
};

const statusLabels = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  "on-hold": "On Hold",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function WorkOrderTable({
  workOrders,
  sortField,
  sortDirection,
  onSort,
}: WorkOrderTableProps) {
  const SortableHeader = ({
    field,
    children,
  }: {
    field: keyof WorkOrder;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className="h-8 -ml-3 font-medium"
    >
      {children}
      <ArrowUpDown
        className={cn(
          "ml-2 h-4 w-4",
          sortField === field ? "opacity-100" : "opacity-50"
        )}
      />
    </Button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <SortableHeader field="id">ID</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="title">Title</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="status">Status</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="priority">Priority</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="clientName">Client</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="assignedTo">Assigned To</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="dueDate">Due Date</SortableHeader>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No work orders found.
              </TableCell>
            </TableRow>
          ) : (
            workOrders.map((workOrder) => {
              const isOverdue =
                workOrder.dueDate < new Date() && workOrder.status !== "completed";

              return (
                <TableRow key={workOrder.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {workOrder.id}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{workOrder.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {workOrder.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", statusStyles[workOrder.status])}
                    >
                      {statusLabels[workOrder.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", priorityStyles[workOrder.priority])}>
                      {priorityLabels[workOrder.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>{workOrder.clientName}</TableCell>
                  <TableCell>{workOrder.assignedTo}</TableCell>
                  <TableCell
                    className={cn(isOverdue && "text-destructive font-medium")}
                  >
                    {format(workOrder.dueDate, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Change Status</DropdownMenuItem>
                        <DropdownMenuItem>Reassign</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
