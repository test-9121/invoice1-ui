import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  Share2,
  FileText,
  MoreHorizontal,
  Plus,
  Mic
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const invoices = [
  { id: "INV-0042", client: "ABC Pvt Ltd", date: "Dec 9, 2024", status: "Paid", amount: "₹29,500" },
  { id: "INV-0041", client: "XYZ Corp", date: "Dec 7, 2024", status: "Pending", amount: "₹45,000" },
  { id: "INV-0040", client: "Tech Solutions", date: "Dec 6, 2024", status: "Paid", amount: "₹18,500" },
  { id: "INV-0039", client: "Design Hub", date: "Dec 5, 2024", status: "Overdue", amount: "₹32,000" },
  { id: "INV-0038", client: "Global Inc", date: "Dec 4, 2024", status: "Paid", amount: "₹55,000" },
  { id: "INV-0037", client: "Startup Labs", date: "Dec 3, 2024", status: "Paid", amount: "₹12,000" },
  { id: "INV-0036", client: "Creative Co", date: "Dec 2, 2024", status: "Pending", amount: "₹28,000" },
  { id: "INV-0035", client: "Tech Innovate", date: "Dec 1, 2024", status: "Paid", amount: "₹42,000" },
];

const InvoiceHistory = () => {
  const navigate = useNavigate();
  const [selectedInvoice, setSelectedInvoice] = useState(invoices[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-success/10 text-success";
      case "Pending": return "bg-warning/10 text-warning";
      case "Overdue": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Invoice History" subtitle="View and manage all invoices" />
      
      <div className="p-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button 
            variant="accent" 
            onClick={() => navigate('/invoice/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/voice-input')}
          >
            <Mic className="w-4 h-4 mr-2" />
            Voice Input
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Invoice List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2"
          >
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-11" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="card-elevated overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/50 border-b border-border">
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Invoice ID</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Client</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground hidden md:table-cell">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, index) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedInvoice(invoice)}
                        className={`border-b border-border/50 cursor-pointer transition-colors ${
                          selectedInvoice.id === invoice.id 
                            ? 'bg-accent/10' 
                            : 'hover:bg-secondary/30'
                        }`}
                      >
                        <td className="py-4 px-6 font-medium text-accent">{invoice.id}</td>
                        <td className="py-4 px-6 text-foreground">{invoice.client}</td>
                        <td className="py-4 px-6 text-muted-foreground hidden md:table-cell">{invoice.date}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-semibold text-foreground">{invoice.amount}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                              <Edit3 className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Invoice Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-1"
          >
            <div className="card-elevated p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-accent/10">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedInvoice.id}</h3>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.date}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</p>
                  <p className="text-lg font-medium text-foreground mt-1">{selectedInvoice.client}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <p className="text-xs font-medium text-accent uppercase tracking-wider">Amount</p>
                    <p className="text-lg font-bold text-accent mt-1">{selectedInvoice.amount}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="accent" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Invoice
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Invoice
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHistory;
