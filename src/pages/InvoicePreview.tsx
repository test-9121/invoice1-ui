import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Download, 
  Share2, 
  Edit3, 
  Save, 
  FileText,
  Mic,
  Building2,
  Mail,
  Phone,
  MapPin,
  Pen,
  CheckCircle2,
  Loader2,
  ArrowLeft
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { invoiceService } from "@/services/invoice.service";
import { useToast } from "@/hooks/use-toast";
import type { InvoiceFormData } from "@/types/invoice";
import type { Client } from "@/types/client";

const InvoicePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Get data from navigation state
  const passedInvoiceData = location.state?.invoiceData as InvoiceFormData | undefined;
  const passedClient = location.state?.selectedClient as Client | undefined;

  // Redirect if no data
  useEffect(() => {
    if (!passedInvoiceData) {
      toast({
        title: "No Invoice Data",
        description: "Please create an invoice first.",
        variant: "destructive",
      });
      navigate("/voice-input");
    }
  }, [passedInvoiceData, navigate, toast]);

  // Calculate totals with GST included in each item
  const subtotal = passedInvoiceData?.items.reduce((sum, item) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const taxPercentage = item.taxPercentage;
    const gstRate = taxPercentage ? parseFloat(taxPercentage.replace('%', '')) : 0;
    const itemAmount = quantity * unitPrice * (1 + gstRate / 100);
    return sum + itemAmount;
  }, 0) || 0;
  
  const discountAmount = (subtotal * (passedInvoiceData?.discount || 0)) / 100;
  const total = subtotal - discountAmount;

  // Company info (this should come from settings/profile in a real app)
  const companyInfo = {
    name: "Ensar Solutions",
    address: "123 Business Street, Mumbai, MH 400001",
    email: "contact@yourcompany.com",
    phone: "+91 98765 43210",
    gst: "27AABCU9603R1ZM"
  };

  // Handle finalize invoice
  const handleFinalizeInvoice = async () => {
    if (!passedInvoiceData) return;

    setIsFinalizing(true);
    try {
      const response = await invoiceService.createInvoice(passedInvoiceData);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Invoice has been finalized and created successfully.",
        });
        
        navigate("/invoices");
      } else {
        throw new Error(response.message || 'Failed to create invoice');
      }
    } catch (error: any) {
      console.error('[InvoicePreview] Error finalizing invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to finalize invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  if (!passedInvoiceData) {
    return null; // Will redirect in useEffect
  }

  console.log('=== InvoicePreview Debug ===');
  console.log('Passed Invoice Data:', passedInvoiceData);
  console.log('Invoice clientId:', passedInvoiceData.clientId, 'Type:', typeof passedInvoiceData.clientId);
  console.log('Passed Client:', passedClient);
  console.log('Client ID:', passedClient?.id, 'Type:', typeof passedClient?.id);
  console.log('=========================');

  return (
    <div className="min-h-screen pb-8">
      <Header title="Invoice Preview" subtitle="Review your invoice before finalizing" />
      
      <div className="p-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Edit
        </Button>

        <div className="grid grid-cols-1 gap-6">
          {/* Invoice Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card-elevated p-8 bg-card">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 pb-6 border-b border-border">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-navy-light flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{companyInfo.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{companyInfo.address}</p>
                  <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {companyInfo.email}
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {companyInfo.phone}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">GST: {companyInfo.gst}</p>
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-bold text-accent mb-2">INVOICE</h1>
                  <p className="text-lg font-semibold text-foreground">DRAFT</p>
                  <div className="mt-4 space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      Issue Date: <span className="text-foreground">{passedInvoiceData.issuedDate}</span>
                    </p>
                    {passedInvoiceData.dueDate && (
                      <p className="text-muted-foreground">
                        Due Date: <span className="text-foreground">{passedInvoiceData.dueDate}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-8 p-4 rounded-xl bg-secondary/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Bill To</p>
                <h3 className="text-lg font-semibold text-foreground">
                  {passedClient?.name || 'Client Name'}
                </h3>
                {passedClient?.company && (
                  <p className="text-sm text-muted-foreground">{passedClient.company}</p>
                )}
                {passedClient && (
                  <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                    {passedClient.email && (
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {passedClient.email}
                      </span>
                    )}
                    {passedClient.mobile && (
                      <span className="flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {passedClient.mobile}
                      </span>
                    )}
                    {passedClient.billingAddressLine1 && (
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> 
                        {passedClient.billingAddressLine1}, {passedClient.city}, {passedClient.state} {passedClient.postalCode}
                      </span>
                    )}
                    {passedClient.gstNumber && (
                      <p className="text-xs mt-1">GST: {passedClient.gstNumber}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="text-left py-3 px-4 rounded-l-lg font-medium">Item</th>
                      <th className="text-left py-3 px-4 font-medium">HSN/SAC</th>
                      <th className="text-left py-3 px-4 font-medium">Category</th>
                      <th className="text-center py-3 px-4 font-medium">Qty</th>
                      <th className="text-right py-3 px-4 font-medium">Rate</th>
                      <th className="text-center py-3 px-4 font-medium">GST</th>
                      <th className="text-right py-3 px-4 rounded-r-lg font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passedInvoiceData.items.map((item, index) => {
                      const quantity = item.quantity || 0;
                      const unitPrice = item.unitPrice || 0;
                      const taxPercentage = item.taxPercentage;
                      const gstRate = taxPercentage ? parseFloat(taxPercentage.replace('%', '')) : 0;
                      const itemAmount = quantity * unitPrice * (1 + gstRate / 100);
                      
                      return (
                        <tr key={index} className="border-b border-border">
                          <td className="py-4 px-4 font-medium text-foreground">{item.name}</td>
                          <td className="py-4 px-4 text-foreground">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-300">
                              {item.hsnCode || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">{item.category || 'N/A'}</td>
                          <td className="py-4 px-4 text-center text-foreground">{quantity}</td>
                          <td className="py-4 px-4 text-right text-foreground">₹{unitPrice.toLocaleString()}</td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-300 font-medium">
                              {item.taxPercentage || '0%'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-semibold text-foreground">
                            ₹{itemAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* GST Breakdown Summary */}
              <div className="mb-8 p-4 rounded-xl bg-secondary/30 border border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">GST Breakdown</p>
                <div className="space-y-2">
                  {(() => {
                    // Group items by GST rate
                    const gstGroups = passedInvoiceData.items.reduce((acc, item) => {
                      const quantity = item.quantity || 0;
                      const unitPrice = item.unitPrice || 0;
                      const taxPercentage = item.taxPercentage || '0%';
                      const gstRate = parseFloat(taxPercentage.replace('%', ''));
                      
                      const baseAmount = quantity * unitPrice;
                      const gstAmount = baseAmount * (gstRate / 100);
                      const totalAmount = baseAmount + gstAmount;
                      
                      if (!acc[taxPercentage]) {
                        acc[taxPercentage] = {
                          rate: taxPercentage,
                          baseAmount: 0,
                          gstAmount: 0,
                          totalAmount: 0
                        };
                      }
                      
                      acc[taxPercentage].baseAmount += baseAmount;
                      acc[taxPercentage].gstAmount += gstAmount;
                      acc[taxPercentage].totalAmount += totalAmount;
                      
                      return acc;
                    }, {} as Record<string, { rate: string; baseAmount: number; gstAmount: number; totalAmount: number }>);
                    
                    return Object.values(gstGroups).map((group, index) => (
                      <div key={index} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-300 font-medium">
                            {group.rate}
                          </span>
                          <span className="text-muted-foreground">GST on ₹{group.baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <span className="font-medium text-foreground">
                          ₹{group.gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ));
                  })()}
                  <div className="flex justify-between items-center text-sm pt-2 border-t-2 border-border">
                    <span className="font-semibold text-foreground">Total GST Amount</span>
                    <span className="font-bold text-accent">
                      ₹{passedInvoiceData.items.reduce((sum, item) => {
                        const quantity = item.quantity || 0;
                        const unitPrice = item.unitPrice || 0;
                        const taxPercentage = item.taxPercentage || '0%';
                        const gstRate = parseFloat(taxPercentage.replace('%', ''));
                        const baseAmount = quantity * unitPrice;
                        const gstAmount = baseAmount * (gstRate / 100);
                        return sum + gstAmount;
                      }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-full sm:w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal (incl. GST)</span>
                    <span className="text-foreground font-medium">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {passedInvoiceData.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount ({passedInvoiceData.discount}%)</span>
                      <span className="text-red-600 font-medium">-₹{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-lg font-semibold text-foreground">Total Amount</span>
                    <span className="text-lg font-bold text-accent">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    * GST is included in line item amounts
                  </p>
                </div>
              </div>

              {/* Notes */}
              {passedInvoiceData.notes && (
                <div className="pt-6 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground">{passedInvoiceData.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isFinalizing}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Edit Invoice
                </Button>
                <Button
                  variant="accent"
                  className="flex-1"
                  onClick={handleFinalizeInvoice}
                  disabled={isFinalizing}
                >
                  {isFinalizing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Finalize Invoice
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
