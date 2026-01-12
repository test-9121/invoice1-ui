import { useState } from "react";
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
  Pen
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const InvoicePreview = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const invoiceData = {
    id: "INV-0042",
    date: "December 9, 2024",
    dueDate: "December 24, 2024",
    company: {
      name: "Your Company Name",
      address: "123 Business Street, Mumbai, MH 400001",
      email: "contact@yourcompany.com",
      phone: "+91 98765 43210",
      gst: "27AABCU9603R1ZM"
    },
    client: {
      name: "ABC Pvt Ltd",
      address: "456 Client Avenue, Bangalore, KA 560001",
      email: "accounts@abcpvtltd.com",
      phone: "+91 87654 32109",
      gst: "29AABCU9603R1ZM"
    },
    items: [
      { name: "Web Design Services", description: "Complete website redesign with responsive layout", qty: 1, rate: 25000, tax: 18, total: 29500 }
    ],
    subtotal: 25000,
    taxAmount: 4500,
    total: 29500,
    notes: "Thank you for your business. Payment is due within 15 days."
  };

  const voiceCommands = [
    "Add item",
    "Change quantity",
    "Update rate",
    "Apply discount",
    "Change client",
    "Save invoice"
  ];

  return (
    <div className="min-h-screen pb-8">
      <Header title="Invoice Preview" subtitle={`Invoice ${invoiceData.id}`} />
      
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Invoice Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="xl:col-span-2"
          >
            <div className="card-elevated p-8 bg-card">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 pb-6 border-b border-border">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-navy-light flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{invoiceData.company.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{invoiceData.company.address}</p>
                  <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {invoiceData.company.email}
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {invoiceData.company.phone}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-bold text-accent mb-2">INVOICE</h1>
                  <p className="text-lg font-semibold text-foreground">{invoiceData.id}</p>
                  <div className="mt-4 space-y-1 text-sm">
                    <p className="text-muted-foreground">Date: <span className="text-foreground">{invoiceData.date}</span></p>
                    <p className="text-muted-foreground">Due Date: <span className="text-foreground">{invoiceData.dueDate}</span></p>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-8 p-4 rounded-xl bg-secondary/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Bill To</p>
                <h3 className="text-lg font-semibold text-foreground">{invoiceData.client.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" /> {invoiceData.client.address}
                </p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> {invoiceData.client.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" /> {invoiceData.client.phone}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">GST: {invoiceData.client.gst}</p>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="text-left py-3 px-4 rounded-l-lg font-medium">Item</th>
                      <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Description</th>
                      <th className="text-center py-3 px-4 font-medium">Qty</th>
                      <th className="text-right py-3 px-4 font-medium">Rate</th>
                      <th className="text-center py-3 px-4 font-medium">Tax</th>
                      <th className="text-right py-3 px-4 rounded-r-lg font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="py-4 px-4 font-medium text-foreground">{item.name}</td>
                        <td className="py-4 px-4 text-sm text-muted-foreground hidden sm:table-cell">{item.description}</td>
                        <td className="py-4 px-4 text-center text-foreground">{item.qty}</td>
                        <td className="py-4 px-4 text-right text-foreground">₹{item.rate.toLocaleString()}</td>
                        <td className="py-4 px-4 text-center text-foreground">{item.tax}%</td>
                        <td className="py-4 px-4 text-right font-semibold text-foreground">₹{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-full sm:w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{invoiceData.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span className="text-foreground">₹{invoiceData.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-accent">₹{invoiceData.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-6 border-t border-border">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground">{invoiceData.notes}</p>
                </div>
                <div className="text-center">
                  <div className="w-48 h-16 border-b-2 border-border mb-2 flex items-end justify-center pb-1">
                    <Pen className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Authorized Signature</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Voice Commands */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mic className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Voice Commands</h3>
              </div>
              <div className="space-y-2">
                {voiceCommands.map((cmd) => (
                  <button
                    key={cmd}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary text-sm text-left text-muted-foreground hover:text-foreground transition-colors"
                  >
                    "{cmd}"
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Edit */}
            <div className="card-elevated p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Edit</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Name</label>
                  <Input defaultValue={invoiceData.client.name} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</label>
                  <Input type="date" defaultValue="2024-12-24" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
                  <textarea 
                    className="mt-1 w-full h-20 px-4 py-2 rounded-xl border-2 border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    defaultValue={invoiceData.notes}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button variant="accent" size="lg" className="w-full">
                <Save className="w-5 h-5 mr-2" />
                Finalize Invoice
              </Button>
              <Button variant="outline-navy" size="lg" className="w-full">
                <FileText className="w-5 h-5 mr-2" />
                Generate Work Order
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
              <Button variant="ghost" size="lg" className="w-full text-muted-foreground">
                Save as Draft
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
