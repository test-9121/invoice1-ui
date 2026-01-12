import { format } from "date-fns";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WorkOrder } from "@/types/workOrder";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
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

export function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  const isOverdue = workOrder.dueDate < new Date() && workOrder.status !== "completed";

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                {workOrder.id}
              </span>
              <Badge
                variant="outline"
                className={cn("text-xs", statusStyles[workOrder.status])}
              >
                {statusLabels[workOrder.status]}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {workOrder.title}
            </h3>
          </div>
          <Badge className={cn("shrink-0", priorityStyles[workOrder.priority])}>
            {priorityLabels[workOrder.priority]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {workOrder.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="truncate">{workOrder.assignedTo}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{workOrder.location}</span>
          </div>
          <div
            className={cn(
              "flex items-center gap-2",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-4 w-4" />
            <span>{format(workOrder.dueDate, "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{workOrder.estimatedHours}h estimated</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            {workOrder.clientName}
          </span>
          <div className="flex gap-1">
            {workOrder.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {workOrder.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{workOrder.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
