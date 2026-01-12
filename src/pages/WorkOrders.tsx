import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Eye, 
  Edit3, 
  Trash2,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle2,
  Link,
  Search,
  Filter,
  X
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface WorkOrder {
  id: string;
  invoiceId: string;
  client: string;
  description: string;
  assignedTo: string;
  startDate: string;
  dueDate: string;
  status: string;
}

const initialWorkOrders: WorkOrder[] = [
  { 
    id: "WO-012", 
    invoiceId: "INV-0042",
    client: "ABC Pvt Ltd", 
    description: "Website Redesign & Development",
    assignedTo: "John Smith",
    startDate: "Dec 10, 2024",
    dueDate: "Dec 25, 2024",
    status: "In Progress"
  },
  { 
    id: "WO-011", 
    invoiceId: "INV-0041",
    client: "XYZ Corp", 
    description: "Mobile App Development - Phase 1",
    assignedTo: "Sarah Johnson",
    startDate: "Dec 8, 2024",
    dueDate: "Jan 15, 2025",
    status: "In Progress"
  },
  { 
    id: "WO-010", 
    invoiceId: "INV-0040",
    client: "Tech Solutions", 
    description: "SEO Optimization & Analytics Setup",
    assignedTo: "Mike Wilson",
    startDate: "Dec 5, 2024",
    dueDate: "Dec 12, 2024",
    status: "Completed"
  },
  { 
    id: "WO-009", 
    invoiceId: "INV-0039",
    client: "Design Hub", 
    description: "Brand Identity & Logo Design",
    assignedTo: "Emily Brown",
    startDate: "Dec 1, 2024",
    dueDate: "Dec 20, 2024",
    status: "Pending"
  },
];

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [formData, setFormData] = useState({
    client: "",
    description: "",
    assignedTo: "",
    startDate: "",
    dueDate: "",
    status: "Pending",
    invoiceId: ""
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-success/10 text-success border-success/20";
      case "In Progress": return "bg-accent/10 text-accent border-accent/20";
      case "Pending": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return CheckCircle2;
      case "In Progress": return Clock;
      case "Pending": return Clock;
      default: return Clock;
    }
  };

  // Filter work orders
  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Create Work Order
  const handleCreate = () => {
    const newId = `WO-${String(workOrders.length + 1).padStart(3, '0')}`;
    const newOrder: WorkOrder = {
      id: newId,
      invoiceId: formData.invoiceId || `INV-${String(workOrders.length + 40).padStart(4, '0')}`,
      client: formData.client,
      description: formData.description,
      assignedTo: formData.assignedTo,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      status: formData.status
    };
    setWorkOrders([newOrder, ...workOrders]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success("Work order created successfully!", {
      description: `${newId} has been created.`
    });
  };

  // View Work Order
  const handleView = (order: WorkOrder) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  // Edit Work Order
  const handleEditClick = (order: WorkOrder) => {
    setSelectedOrder(order);
    setFormData({
      client: order.client,
      description: order.description,
      assignedTo: order.assignedTo,
      startDate: order.startDate,
      dueDate: order.dueDate,
      status: order.status,
      invoiceId: order.invoiceId
    });
    setIsEditDialogOpen(true);
  };

  const handleEdit = () => {
    if (!selectedOrder) return;
    setWorkOrders(workOrders.map(order => 
      order.id === selectedOrder.id 
        ? { ...order, ...formData }
        : order
    ));
    setIsEditDialogOpen(false);
    resetForm();
    toast.success("Work order updated successfully!", {
      description: `${selectedOrder.id} has been updated.`
    });
  };

  // Delete Work Order
  const handleDeleteClick = (order: WorkOrder) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedOrder) return;
    setWorkOrders(workOrders.filter(order => order.id !== selectedOrder.id));
    setIsDeleteDialogOpen(false);
    toast.success("Work order deleted", {
      description: `${selectedOrder.id} has been removed.`
    });
  };

  // Export PDF
  const handleExportPDF = (order: WorkOrder) => {
    toast.success("Exporting PDF...", {
      description: `Generating PDF for ${order.id}`
    });
    // Simulate PDF generation
    setTimeout(() => {
      toast.success("PDF exported successfully!", {
        description: `${order.id}_${order.client.replace(/\s+/g, '_')}.pdf`
      });
    }, 1500);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      client: "",
      description: "",
      assignedTo: "",
      startDate: "",
      dueDate: "",
      status: "Pending",
      invoiceId: ""
    });
    setSelectedOrder(null);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    toast.info("Filters cleared");
  };

  return (
    <div className="min-h-screen">
      <Header title="Work Orders" subtitle="Manage project work orders" />
      
      <div className="p-6 space-y-6">
        {/* Actions & Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 justify-between"
        >
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== "all") && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Button variant="accent" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Work Order
          </Button>
        </motion.div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredOrders.length} of {workOrders.length} work orders
        </p>

        {/* Work Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order, index) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-elevated p-6 hover:shadow-xl transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-accent">{order.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {order.status}
                      </span>
                    </div>
                    <h3 className="text-foreground font-medium">{order.description}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleView(order)}
                      title="View details"
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditClick(order)}
                      title="Edit work order"
                    >
                      <Edit3 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteClick(order)}
                      title="Delete work order"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Client:</span>
                    <span className="text-foreground font-medium">{order.client}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Assigned:</span>
                    <span className="text-foreground font-medium">{order.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="text-foreground">{order.startDate} → {order.dueDate}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link className="w-4 h-4" />
                    <span>Linked to </span>
                    <span className="text-accent font-medium">{order.invoiceId}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExportPDF(order)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No work orders found matching your filters.</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Work Order</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new work order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Enter client name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter work order description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="Enter assignee name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  placeholder="e.g., Dec 10, 2024"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  placeholder="e.g., Dec 25, 2024"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.client || !formData.description}>
              Create Work Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedOrder?.id} - Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client:</span>
                <span className="font-medium">{selectedOrder.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Description:</span>
                <span className="font-medium text-right max-w-[60%]">{selectedOrder.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned To:</span>
                <span className="font-medium">{selectedOrder.assignedTo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">{selectedOrder.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-medium">{selectedOrder.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Linked Invoice:</span>
                <span className="font-medium text-accent">{selectedOrder.invoiceId}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => { setIsViewDialogOpen(false); handleEditClick(selectedOrder!); }}>
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Work Order - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Update the work order details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-client">Client</Label>
              <Input
                id="edit-client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-assignedTo">Assigned To</Label>
              <Input
                id="edit-assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Work Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedOrder?.id}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrders;
