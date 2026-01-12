// Client Details Dialog Component

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  TrendingUp,
  User,
  Building2,
  CreditCard,
  Edit3,
  Trash2,
  Loader2
} from "lucide-react";
import { clientService } from "@/services/client.service";
import type { Client, ClientStatistics } from "@/types/client";
import { useToast } from "@/hooks/use-toast";

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export const ClientDetailsDialog = ({
  open,
  onOpenChange,
  client,
  onEdit,
  onDelete,
}: ClientDetailsDialogProps) => {
  const [statistics, setStatistics] = useState<ClientStatistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (client && open) {
      fetchStatistics();
    }
  }, [client, open]);

  const fetchStatistics = async () => {
    if (!client) return;

    try {
      setIsLoadingStats(true);
      const response = await clientService.getClientStatistics(client.id);
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
      toast({
        title: "Error",
        description: "Failed to load client statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (!client) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{client.name}</DialogTitle>
              <DialogDescription>{client.company}</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(client)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(client.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-elevated p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{client.totalInvoices}</p>
                    <p className="text-sm text-muted-foreground">Total Invoices</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-elevated p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{client.pendingInvoices}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-elevated p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{formatCurrency(client.totalAmount)}</p>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Business Details */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {client.gstNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">GST Number</p>
                    <p className="font-mono font-medium">{client.gstNumber}</p>
                  </div>
                )}
                {client.panNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">PAN Number</p>
                    <p className="font-mono font-medium">{client.panNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    client.status === 'ACTIVE' ? 'bg-success/10 text-success' :
                    client.status === 'INACTIVE' ? 'bg-muted text-muted-foreground' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {client.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{formatDate(client.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address
              </h3>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Primary Address</p>
                <p>{client.address.street}</p>
                <p>{client.address.city}, {client.address.state} {client.address.zipCode}</p>
                <p>{client.address.country}</p>
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="card-elevated p-6">
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                <p className="text-muted-foreground">{client.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-6 mt-4">
            {/* Primary Contact */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="text-lg font-semibold">Primary Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${client.email}`} className="font-medium hover:text-accent">
                      {client.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a href={`tel:${client.phone}`} className="font-medium hover:text-accent">
                      {client.phone}
                    </a>
                  </div>
                </div>
                {client.alternatePhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Alternate Phone</p>
                      <a href={`tel:${client.alternatePhone}`} className="font-medium hover:text-accent">
                        {client.alternatePhone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Person */}
            {client.contactPerson && (
              <div className="card-elevated p-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Person
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{client.contactPerson.name}</p>
                  </div>
                  {client.contactPerson.designation && (
                    <div>
                      <p className="text-sm text-muted-foreground">Designation</p>
                      <p className="font-medium">{client.contactPerson.designation}</p>
                    </div>
                  )}
                  {client.contactPerson.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href={`mailto:${client.contactPerson.email}`} className="font-medium hover:text-accent">
                        {client.contactPerson.email}
                      </a>
                    </div>
                  )}
                  {client.contactPerson.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a href={`tel:${client.contactPerson.phone}`} className="font-medium hover:text-accent">
                        {client.contactPerson.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6 mt-4">
            {isLoadingStats ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : statistics ? (
              <>
                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-elevated p-6">
                    <p className="text-sm text-muted-foreground mb-2">Total Amount</p>
                    <p className="text-3xl font-bold">{formatCurrency(statistics.totalAmount)}</p>
                  </div>
                  <div className="card-elevated p-6">
                    <p className="text-sm text-muted-foreground mb-2">Paid Amount</p>
                    <p className="text-3xl font-bold text-success">{formatCurrency(statistics.paidAmount)}</p>
                  </div>
                  <div className="card-elevated p-6">
                    <p className="text-sm text-muted-foreground mb-2">Pending Amount</p>
                    <p className="text-3xl font-bold text-warning">{formatCurrency(statistics.pendingAmount)}</p>
                  </div>
                  <div className="card-elevated p-6">
                    <p className="text-sm text-muted-foreground mb-2">Overdue Amount</p>
                    <p className="text-3xl font-bold text-destructive">{formatCurrency(statistics.overdueAmount)}</p>
                  </div>
                </div>

                {/* Invoice Stats */}
                <div className="card-elevated p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Invoice Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Invoices</p>
                      <p className="text-2xl font-bold">{statistics.totalInvoices}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-success">{statistics.completedInvoices}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-warning">{statistics.pendingInvoices}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Invoice Amount</p>
                    <p className="text-xl font-bold">{formatCurrency(statistics.averageInvoiceAmount)}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="card-elevated p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Timeline</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">First Invoice</p>
                      <p className="font-medium">{formatDate(statistics.firstInvoiceDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Invoice</p>
                      <p className="font-medium">{formatDate(statistics.lastInvoiceDate)}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No statistics available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
