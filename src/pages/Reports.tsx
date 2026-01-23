import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Download, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Loader2
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ForeignKeyField } from "@/components/ui/foreign-key-field";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { reportsService, type ReportsData, type ReportFilters } from "@/services/reports.service";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { toast } = useToast();
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'last_6_months',
    status: 'all',
    clientId: null
  });

  useEffect(() => {
    fetchReportsData();
  }, [filters]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const response = await reportsService.getReportsData(filters);
      if (response.success && response.data) {
        setReportsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        title: "Error",
        description: "Failed to load reports data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: 'pdf' | 'excel') => {
    try {
      setExporting(true);
      const blob = await reportsService.exportReport(filters, format);
      reportsService.downloadExportedReport(blob, format);
      toast({
        title: "Success",
        description: `Report exported as ${format.toUpperCase()} successfully.`,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Error",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (value: number): string => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(2)}K`;
    return `₹${value}`;
  };

  const getSummaryStats = () => {
    if (!reportsData) return [];
    
    const { summary } = reportsData;
    return [
      { 
        label: "Total Invoices", 
        value: summary.totalInvoices.value.toLocaleString(), 
        icon: FileText, 
        change: `${summary.totalInvoices.change > 0 ? '+' : ''}${summary.totalInvoices.change}%`, 
        positive: summary.totalInvoices.changeType === 'increase' 
      },
      { 
        label: "Paid", 
        value: summary.paidInvoices.value.toLocaleString(), 
        icon: CheckCircle2, 
        change: `${summary.paidInvoices.change > 0 ? '+' : ''}${summary.paidInvoices.change}%`, 
        positive: summary.paidInvoices.changeType === 'increase' 
      },
      { 
        label: "Unpaid", 
        value: summary.unpaidInvoices.value.toLocaleString(), 
        icon: Clock, 
        change: `${summary.unpaidInvoices.change > 0 ? '+' : ''}${summary.unpaidInvoices.change}%`, 
        positive: summary.unpaidInvoices.changeType === 'decrease' 
      },
      { 
        label: "Total Revenue", 
        value: formatCurrency(summary.totalRevenue.value), 
        icon: DollarSign, 
        change: `${summary.totalRevenue.change > 0 ? '+' : ''}${summary.totalRevenue.change}%`, 
        positive: summary.totalRevenue.changeType === 'increase' 
      },
    ];
  };

  const getPieChartData = () => {
    if (!reportsData) return [];
    
    const colorMap = {
      paid: "hsl(142, 76%, 36%)",
      pending: "hsl(45, 93%, 47%)",
      overdue: "hsl(0, 84%, 60%)",
    };

    return reportsData.paymentStatus.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.percentage,
      count: item.count,
      color: colorMap[item.status]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Reports & Analytics" subtitle="Insights into your invoicing" />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <Header title="Reports & Analytics" subtitle="Insights into your invoicing" />
      
      <div className="p-6 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 items-center justify-between"
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <select 
                className="bg-transparent text-sm text-foreground focus:outline-none"
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
              >
                <option value="last_6_months">Last 6 months</option>
                <option value="last_3_months">Last 3 months</option>
                <option value="last_30_days">Last 30 days</option>
                <option value="this_year">This year</option>
              </select>
            </div>
            <div className="w-[250px]">
              <ForeignKeyField
                value={filters.clientId}
                onChange={(value) => handleFilterChange('clientId', value as number | null)}
                options={reportsData?.clients.map(client => ({
                  id: client.id,
                  label: client.name,
                })) || []}
                placeholder="All Clients"
                searchPlaceholder="Search clients..."
                allowClear
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
              <select 
                className="bg-transparent text-sm text-foreground focus:outline-none"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <Button 
            variant="accent" 
            onClick={() => handleExportReport('pdf')}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download Report
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {getSummaryStats().map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-accent/10">
                  <stat.icon className="w-5 h-5 text-accent" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                  {stat.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elevated p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Invoice Volume Over Time</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsData?.invoiceVolume || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-elevated p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Payment Status</h3>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value}% (${props.payload.count} invoices)`,
                      name
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Line Chart - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-elevated p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Monthly Revenue Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportsData?.revenueTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, fill: 'hsl(var(--accent))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
