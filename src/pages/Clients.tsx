import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  Building2,
  Mic,
  Filter,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClientDetailsDialog } from "@/components/clients/ClientDetailsDialog";
import { useClients } from "@/hooks/useClients";
import type { Client } from "@/types/client";
import { useDebounce } from "../hooks/useDebounce";

const Clients = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const {
    clients,
    isLoading,
    error,
    pagination,
    deleteClient,
    updateFilters,
  } = useClients({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Update filters when search or status changes
  useEffect(() => {
    console.log('[Clients] Updating filters with:', {
      search: debouncedSearch,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      hasPending: showPendingOnly || undefined,
    });
    updateFilters({
      search: debouncedSearch,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      hasPending: showPendingOnly || undefined,
    });
  }, [debouncedSearch, statusFilter, showPendingOnly, updateFilters]);

  const handleAddClient = () => {
    navigate('/clients/new');
  };

  const handleEditClient = (client: Client) => {
    navigate(`/clients/edit/${client.id}`);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
  };

  const handleDeleteClick = (clientId: string) => {
    setClientToDelete(clientId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (clientToDelete) {
      const success = await deleteClient(clientToDelete);
      if (success) {
        setIsDeleteDialogOpen(false);
        setClientToDelete(null);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    // Clamp page to valid range and avoid redundant updates
    const minPage = 1;
    const maxPage = Math.max(1, pagination.totalPages || 1);
    const clamped = Math.max(minPage, Math.min(maxPage, newPage));

    if (clamped === pagination.page) return; // no change

    updateFilters({ page: clamped });
  };

  return (
    <div className="min-h-screen">
      <Header title="Clients" subtitle="Manage your client database" />
      
      <div className="p-6 space-y-6">
        {/* Search and Actions */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          <div className="flex flex-1 gap-4 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by client name, email or phone number..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'ALL' | 'ACTIVE' | 'INACTIVE')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showPendingOnly ? "default" : "outline"}
              size="icon"
              onClick={() => setShowPendingOnly(!showPendingOnly)}
              title="Show pending only"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="accent" size="sm" onClick={handleAddClient}>
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>
        </motion.div>

        {/* Voice Shortcuts */}
        {/* <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-accent/10 border border-accent/20"
        >
          <Mic className="w-5 h-5 text-accent" />
          <p className="text-sm text-muted-foreground">
            Voice shortcuts: 
            <span className="text-foreground font-medium ml-2">"Add client"</span>,
            <span className="text-foreground font-medium ml-2">"Show clients with pending invoices"</span>,
            <span className="text-foreground font-medium ml-2">"Search [name]"</span>
          </p>
        </motion.div> */}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && clients && clients.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && clients && clients.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-12 text-center"
          >
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "ALL" || showPendingOnly
                ? "Try adjusting your filters"
                : "Get started by adding your first client"}
            </p>
            {!searchQuery && statusFilter === "ALL" && !showPendingOnly && (
              <Button variant="accent" onClick={handleAddClient}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Client
              </Button>
            )}
          </motion.div>
        )}

        {/* Clients Table */}
        {!isLoading && clients && clients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elevated overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Client</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground hidden lg:table-cell">GST Number</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Invoices</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Pending</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {clients.map((client, index) => (
                      <motion.tr 
                        key={client.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: 0.05 * index }}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-navy-light flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{client.name}</p>
                              <p className="text-sm text-muted-foreground">{client.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                          <div className="space-y-1">
                            <p className="text-sm text-foreground flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                              {client.email}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5" />
                              {client.mobile}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden lg:table-cell">
                          <span className="text-sm font-mono text-muted-foreground">
                            {client.gstNumber || "—"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-semibold text-foreground">{client.totalInvoices || 0}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {client.pendingInvoices && client.pendingInvoices > 0 ? (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                              {client.pendingInvoices}
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                              0
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            client.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                          }`}>
                            {client.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* <button
                              onClick={() => handleViewClient(client)}
                              className="p-2 rounded-lg hover:bg-secondary transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </button> */}
                            <button
                              onClick={() => handleEditClient(client)}
                              className="p-2 rounded-lg hover:bg-secondary transition-colors"
                              title="Edit client"
                            >
                              <Edit3 className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(client.id)}
                              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                              title="Delete client"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {clients && clients.length > 0 && (
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} clients
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
                    <Select
                      value={String(pagination.limit)}
                      onValueChange={(value) => updateFilters({ limit: Number(value), page: 1 })}
                    >
                      <SelectTrigger className="w-[80px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev || isLoading}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {pagination.totalPages > 0 && Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const currentPage = pagination.page;
                        return page === 1 || page === pagination.totalPages || 
                               (page >= currentPage - 1 && page <= currentPage + 1);
                      })
                      .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                            <Button
                              variant={page === pagination.page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              disabled={isLoading}
                              className="min-w-[40px]"
                            >
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext || isLoading}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Dialogs */}
      <ClientDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        client={selectedClient}
        onEdit={(client) => {
          setIsDetailsOpen(false);
          handleEditClient(client);
        }}
        onDelete={(clientId) => {
          setIsDetailsOpen(false);
          handleDeleteClick(clientId);
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
