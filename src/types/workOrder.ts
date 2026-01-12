export type WorkOrderStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WorkOrderCategory = 'maintenance' | 'repair' | 'installation' | 'inspection' | 'other';

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  category: WorkOrderCategory;
  clientId: string;
  clientName: string;
  assignedTo: string;
  createdAt: Date;
  dueDate: Date;
  estimatedHours: number;
  location: string;
  tags: string[];
}

export interface WorkOrderFilters {
  search: string;
  status: WorkOrderStatus[];
  priority: WorkOrderPriority[];
  category: WorkOrderCategory[];
  assignedTo: string[];
  dateRange: { from: Date | undefined; to: Date | undefined };
  client: string[];
}
