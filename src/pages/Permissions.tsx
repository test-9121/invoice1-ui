import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Search,
  RefreshCw,
  Lock,
  Shield,
  Filter
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { roleService } from "@/services/role.service";
import type { Permission } from "@/types/role";

const Permissions = () => {
  const { toast } = useToast();
  
  // Permissions state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch permissions
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter !== "ALL" && { category: categoryFilter })
      };

      const response = await roleService.getPermissions(params);

      if (response.success) {
        // Handle case where data might be direct array or pageable object
        const permissionsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || [];
        const totalPages = Array.isArray(response.data) 
          ? 1 
          : response.data.totalPages || 1;
        const totalElements = Array.isArray(response.data) 
          ? response.data.length 
          : response.data.totalElements || 0;
        
        setPermissions(permissionsData);
        setTotalPages(totalPages);
        setTotalElements(totalElements);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPermissions();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, categoryFilter, pageSize, searchQuery]);

  // Get unique categories
  const categories = ["ALL", ...new Set(permissions.map(p => p.category || "Other"))];

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get category color
  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      "User Management": "bg-blue-500/10 text-blue-700 border-blue-200",
      "Invoice": "bg-green-500/10 text-green-700 border-green-200",
      "Client": "bg-purple-500/10 text-purple-700 border-purple-200",
      "Report": "bg-orange-500/10 text-orange-700 border-orange-200",
      "Settings": "bg-red-500/10 text-red-700 border-red-200",
      "Other": "bg-gray-500/10 text-gray-700 border-gray-200"
    };
    return colors[category || "Other"] || colors["Other"];
  };

  return (
    <div className="min-h-screen pb-8">
      <Header title="Permissions" subtitle="View and manage system permissions" />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-4 bg-gradient-to-br from-primary/10 to-primary/5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Permissions</p>
                <p className="text-2xl font-bold text-foreground">{totalElements}</p>
              </div>
              <Key className="w-10 h-10 text-primary opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-foreground">
                  {categories.length - 1}
                </p>
              </div>
              <Filter className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elevated p-4 bg-gradient-to-br from-green-500/10 to-green-500/5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Filtered Results</p>
                <p className="text-2xl font-bold text-foreground">
                  {permissions.length}
                </p>
              </div>
              <Shield className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions by module, action or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            {/* <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}

            {/* Refresh Button */}
            <Button variant="outline" onClick={fetchPermissions} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Permissions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-elevated overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Permission[module:action]</TableHead>
                  <TableHead className="w-[400px]">Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading permissions...</p>
                    </TableCell>
                  </TableRow>
                ) : permissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Key className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No permissions found</p>
                      {(searchQuery || categoryFilter !== "ALL") && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Try adjusting your filters
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((permission) => (
                    <TableRow key={permission.id} className="hover:bg-secondary/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                            <Lock className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {permission.module}: {permission.action}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {permission.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground line-clamp-2">
                          {permission.description}
                        </p>
                      </TableCell>
                      {/* <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getCategoryColor(permission.category)} border`}
                        >
                          {permission.category || "Other"}
                        </Badge>
                      </TableCell> */}
                      <TableCell>
                        <p className="text-sm text-muted-foreground whitespace-nowrap">
                          {/* {formatDate(permission.createdAt)} */}
                          {permission.createdAt ? formatDate(permission.createdAt) : "N/A"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(permission.updatedAt)}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-3 border-t">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} permissions
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
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1 || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Info Card */}
        {!loading && permissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-blue-500/10 border border-blue-200 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">About Permissions</p>
                <p className="text-sm text-blue-700 mt-1">
                  Permissions define specific actions users can perform in the system. They are assigned to roles, 
                  which are then assigned to users. This granular approach ensures precise access control across your application.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Permissions;
