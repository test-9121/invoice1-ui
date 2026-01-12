import { motion } from "framer-motion";
import { 
  Download, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  Calendar
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const barData = [
  { month: "Jul", invoices: 45 },
  { month: "Aug", invoices: 52 },
  { month: "Sep", invoices: 61 },
  { month: "Oct", invoices: 48 },
  { month: "Nov", invoices: 73 },
  { month: "Dec", invoices: 65 },
];

const pieData = [
  { name: "Paid", value: 75, color: "hsl(142, 76%, 36%)" },
  { name: "Pending", value: 18, color: "hsl(45, 93%, 47%)" },
  { name: "Overdue", value: 7, color: "hsl(0, 84%, 60%)" },
];

const lineData = [
  { month: "Jul", revenue: 185000 },
  { month: "Aug", revenue: 220000 },
  { month: "Sep", revenue: 195000 },
  { month: "Oct", revenue: 280000 },
  { month: "Nov", revenue: 310000 },
  { month: "Dec", revenue: 245000 },
];

const summaryStats = [
  { label: "Total Invoices", value: "1,284", icon: FileText, change: "+12%", positive: true },
  { label: "Paid", value: "963", icon: CheckCircle2, change: "+8%", positive: true },
  { label: "Unpaid", value: "321", icon: Clock, change: "-5%", positive: true },
  { label: "Total Revenue", value: "₹24.5L", icon: DollarSign, change: "+18%", positive: true },
];

const Reports = () => {
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
              <select className="bg-transparent text-sm text-foreground focus:outline-none">
                <option>Last 6 months</option>
                <option>Last 3 months</option>
                <option>Last 30 days</option>
                <option>This year</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select className="bg-transparent text-sm text-foreground focus:outline-none">
                <option>All Clients</option>
                <option>ABC Pvt Ltd</option>
                <option>XYZ Corp</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
              <select className="bg-transparent text-sm text-foreground focus:outline-none">
                <option>All Status</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Overdue</option>
              </select>
            </div>
          </div>
          <Button variant="accent">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats.map((stat, index) => (
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
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar dataKey="invoices" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
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
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }}
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
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `₹${(value / 1000)}K`} />
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
