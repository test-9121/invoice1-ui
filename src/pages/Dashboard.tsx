import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Mic, 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Clock,
  MoreHorizontal,
  Eye,
  Download,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardStatistics, RecentInvoice } from "@/services/dashboard.service";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, invoicesResponse] = await Promise.all([
        dashboardService.getStatistics(),
        dashboardService.getRecentInvoices(5)
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data);
      }

      if (invoicesResponse.success && invoicesResponse.data) {
        setRecentInvoices(invoicesResponse.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Get stats configuration
  const getStatsConfig = () => {
    if (!statistics) return [];
    
    return [
      { 
        label: "Total Invoices", 
        value: (statistics.totalInvoices.count || 0).toString(), 
        change: `${statistics.totalInvoices.trend === 'up' ? '+' : statistics.totalInvoices.trend === 'down' ? '-' : ''}${statistics.totalInvoices.changePercentage}%`, 
        trend: statistics.totalInvoices.trend,
        icon: FileText,
        color: "bg-primary text-primary-foreground"
      },
      { 
        label: "Unpaid", 
        value: (statistics.unpaidInvoices.count || 0).toString(), 
        change: `${statistics.unpaidInvoices.trend === 'up' ? '+' : statistics.unpaidInvoices.trend === 'down' ? '-' : ''}${statistics.unpaidInvoices.changePercentage}%`, 
        trend: statistics.unpaidInvoices.trend,
        icon: Clock,
        color: "bg-warning text-foreground"
      },
      { 
        label: "Total Revenue", 
        value: formatCurrency(statistics.totalRevenue.amount || 0), 
        change: `${statistics.totalRevenue.trend === 'up' ? '+' : statistics.totalRevenue.trend === 'down' ? '-' : ''}${statistics.totalRevenue.changePercentage}%`, 
        trend: statistics.totalRevenue.trend,
        icon: DollarSign,
        color: "bg-success text-accent-foreground"
      },
      { 
        label: "Active Clients", 
        value: (statistics.activeClients.count || 0).toString(), 
        change: `${statistics.activeClients.trend === 'up' ? '+' : statistics.activeClients.trend === 'down' ? '-' : ''}${statistics.activeClients.changePercentage}%`, 
        trend: statistics.activeClients.trend,
        icon: Users,
        color: "bg-accent text-accent-foreground"
      },
    ];
  };

  const stats = getStatsConfig();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case "PAID": return "bg-success/10 text-success";
      case "SENT":
      case "PENDING": return "bg-warning/10 text-warning";
      case "OVERDUE": return "bg-destructive/10 text-destructive";
      case "DRAFT": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  console.log('Statistics:', stats, statistics);

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle="Welcome back!" />
      
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
          {loading ? (
            // Loading skeleton for stats
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="stat-card">
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-muted rounded-xl" />
                    <div className="w-16 h-6 bg-muted rounded" />
                  </div>
                  <div className="w-20 h-8 bg-muted rounded mb-2" />
                  <div className="w-32 h-4 bg-muted rounded" />
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
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
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-success' : 
                    stat.trend === 'down' ? 'text-destructive' : 
                    'text-muted-foreground'
                  }`}>
                    {stat.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                    {stat.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                    {stat.trend === 'neutral' && <Minus className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Recent Invoices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card-elevated p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Recent Invoices</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-accent"
                onClick={() => navigate('/invoices')}
              >
                View All <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading invoices...</span>
                </div>
              ) : recentInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No recent invoices</p>
                </div>
              ) : (
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
                        <td className="py-4 px-4 text-sm font-medium text-accent">{invoice.invoiceNumber}</td>
                        <td className="py-4 px-4 text-sm text-foreground">{invoice.clientName}</td>
                        <td className="py-4 px-4 text-sm text-muted-foreground hidden sm:table-cell">{formatDate(invoice.date)}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-foreground">
                          ₹{invoice.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className="p-2 rounded-lg hover:bg-secondary transition-colors"
                              onClick={() => navigate(`/invoices/${invoice.id}`)}
                            >
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
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
