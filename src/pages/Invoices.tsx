import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { invoiceService } from '@/services/invoice.service';
import { useToast } from '@/hooks/use-toast';
import type { Invoice, InvoiceStatus, InvoiceStatistics } from '@/types/invoice';

const Invoices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statistics, setStatistics] = useState<InvoiceStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch invoices
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        size: pageSize,
        search: searchQuery || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      };

      const response = await invoiceService.getInvoices(params);

      if (response.success && response.data) {
        setInvoices(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        setStatistics(response.statistics);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, statusFilter, pageSize, searchQuery]);

  // Get status badge styling
  const getStatusBadge = (status: InvoiceStatus) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700 border-gray-300',
      SENT: 'bg-blue-100 text-blue-700 border-blue-300',
      VIEWED: 'bg-cyan-100 text-cyan-700 border-cyan-300',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      PAID: 'bg-green-100 text-green-700 border-green-300',
      OVERDUE: 'bg-red-100 text-red-700 border-red-300',
      CANCELLED: 'bg-orange-100 text-orange-700 border-orange-300',
      REFUNDED: 'bg-purple-100 text-purple-700 border-purple-300',
    };

    const icons = {
      DRAFT: <Edit className="w-3 h-3" />,
      SENT: <Send className="w-3 h-3" />,
      VIEWED: <Eye className="w-3 h-3" />,
      PARTIALLY_PAID: <DollarSign className="w-3 h-3" />,
      PAID: <CheckCircle2 className="w-3 h-3" />,
      OVERDUE: <AlertCircle className="w-3 h-3" />,
      CANCELLED: <XCircle className="w-3 h-3" />,
      REFUNDED: <RefreshCw className="w-3 h-3" />,
    };

    return (
      <Badge variant="outline" className={`${styles[status]} flex items-center gap-1`}>
        {icons[status]}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Statistics cards data
  const statsCards = statistics
    ? [
        {
          title: 'Total Invoices',
          value: statistics.totalInvoices,
          icon: FileText,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        },
        {
          title: 'Total Amount',
          value: formatCurrency(statistics.totalAmount),
          icon: TrendingUp,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        },
        {
          title: 'Paid Amount',
          value: formatCurrency(statistics.paidAmount),
          icon: CheckCircle2,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
        },
        {
          title: 'Pending Amount',
          value: formatCurrency(statistics.pendingAmount),
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        },
        {
          title: 'Overdue Amount',
          value: formatCurrency(statistics.overdueAmount),
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        },
        {
          title: 'Draft Invoices',
          value: statistics.draftInvoices,
          icon: Edit,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Invoices" subtitle="Manage and track your invoices" />

      <div className="p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-xl font-bold">Invoice List</CardTitle>
              <Button onClick={() => navigate('/voice-input')} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices by number, client name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="VIEWED">Viewed</SelectItem>
                  <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                          <p className="text-muted-foreground">Loading invoices...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-12 h-12 text-muted-foreground" />
                          <p className="text-lg font-medium text-foreground">No invoices found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery || statusFilter !== 'ALL'
                              ? 'Try adjusting your filters'
                              : 'Create your first invoice to get started'}
                          </p>
                          <Button onClick={() => navigate('/voice-input')} className="mt-4">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Invoice
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {formatDate(invoice.issueDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {formatDate(invoice.dueDate)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(invoice.totalAmount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="w-4 h-4 mr-2" />
                                Send to Client
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!isLoading && totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of{' '}
                    {totalElements} invoices
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(Number(value));
                        setCurrentPage(0);
                      }}
                    >
                      <SelectTrigger className="w-[70px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Invoices;
