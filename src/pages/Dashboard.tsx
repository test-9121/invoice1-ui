import { motion } from "framer-motion";
import { 
  Mic, 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  MoreHorizontal,
  Eye,
  Download,
  ArrowUpRight
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const stats = [
  { 
    label: "Total Invoices", 
    value: "1,284", 
    change: "+12%", 
    icon: FileText,
    color: "bg-primary text-primary-foreground"
  },
  { 
    label: "Unpaid", 
    value: "23", 
    change: "-5%", 
    icon: Clock,
    color: "bg-warning text-foreground"
  },
  { 
    label: "Total Revenue", 
    value: "₹24.5L", 
    change: "+18%", 
    icon: DollarSign,
    color: "bg-success text-accent-foreground"
  },
  { 
    label: "Active Clients", 
    value: "156", 
    change: "+8%", 
    icon: Users,
    color: "bg-accent text-accent-foreground"
  },
];

const recentInvoices = [
  { id: "INV-0042", client: "ABC Pvt Ltd", date: "Dec 8, 2024", amount: "₹25,000", status: "Paid" },
  { id: "INV-0041", client: "XYZ Corp", date: "Dec 7, 2024", amount: "₹45,000", status: "Pending" },
  { id: "INV-0040", client: "Tech Solutions", date: "Dec 6, 2024", amount: "₹18,500", status: "Paid" },
  { id: "INV-0039", client: "Design Hub", date: "Dec 5, 2024", amount: "₹32,000", status: "Overdue" },
  { id: "INV-0038", client: "Global Inc", date: "Dec 4, 2024", amount: "₹55,000", status: "Paid" },
];

const pendingWorkOrders = [
  { id: "WO-012", client: "ABC Pvt Ltd", task: "Website Redesign", due: "Dec 15" },
  { id: "WO-011", client: "XYZ Corp", task: "Mobile App Development", due: "Dec 20" },
  { id: "WO-010", client: "Tech Solutions", task: "SEO Optimization", due: "Dec 12" },
];

const Dashboard = () => {
  const navigate = useNavigate();

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
      <Header title="Dashboard" subtitle="Welcome back, John!" />
      
      <div className="p-6 space-y-6">
        {/* Quick Create Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-elevated p-8 bg-gradient-to-br from-primary via-navy-light to-primary text-primary-foreground relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold mb-2">Quick Create Invoice</h2>
              <p className="text-primary-foreground/70 max-w-md">
                Click the mic button and speak your invoice details. Our AI will handle the rest.
              </p>
              <p className="text-sm text-primary-foreground/50 mt-2 italic">
                "Create invoice for ABC Pvt Ltd for web design ₹25,000 with 18% GST"
              </p>
            </div>
            
            <motion.button
              onClick={() => navigate("/voice-input")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="voice-button"
            >
              <Mic className="w-12 h-12" />
              <span className="absolute inset-0 rounded-full border-4 border-accent-foreground/20 voice-pulse" />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="stat-card group hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-success text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 card-elevated p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Recent Invoices</h3>
              <Button variant="ghost" size="sm" className="text-accent">
                View All <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Invoice ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium text-accent">{invoice.id}</td>
                      <td className="py-4 px-4 text-sm text-foreground">{invoice.client}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground hidden sm:table-cell">{invoice.date}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground">{invoice.amount}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                            <Download className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pending Work Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card-elevated p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Pending Work Orders</h3>
              <Button variant="ghost" size="sm" className="text-accent">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {pendingWorkOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-accent">{order.id}</span>
                    <span className="text-xs text-muted-foreground">Due: {order.due}</span>
                  </div>
                  <h4 className="font-medium text-foreground mb-1">{order.task}</h4>
                  <p className="text-sm text-muted-foreground">{order.client}</p>
                </div>
              ))}
            </div>

            <Button variant="outline-accent" className="w-full mt-4">
              Create Work Order
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
