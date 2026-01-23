import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Mail,
  Phone,
  Clock,
  Calendar,
  ChevronDown,
  ChevronRight,
  PlusCircle
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/user.service";
import { roleService } from "@/services/role.service";
import type { User, UserRole } from "@/types/user";
import type { Role } from "@/types/role";
import UserFormDialog from "@/components/users/UserFormDialog";

const Users = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "LOCKED">("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Dialog states
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  
  // Expanded users state for roles
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [userRoles, setUserRoles] = useState<Record<string, Role[]>>({});
  const [loadingUserRoles, setLoadingUserRoles] = useState<Set<string>>(new Set());
  const [deletingRole, setDeletingRole] = useState<{ userId: string; roleId: string } | null>(null);
  
  // Add roles dialog states
  const [showAddRoles, setShowAddRoles] = useState(false);
  const [selectedUserForRoles, setSelectedUserForRoles] = useState<User | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [loadingAllRoles, setLoadingAllRoles] = useState(false);
  const [addingRoles, setAddingRoles] = useState(false);
  const [rolesPage, setRolesPage] = useState(0);
  const [rolesTotalPagesDialog, setRolesTotalPagesDialog] = useState(0);
  const [hasMoreRoles, setHasMoreRoles] = useState(true);
  const [loadingMoreRoles, setLoadingMoreRoles] = useState(false);
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter !== "ALL" && { role: roleFilter }),
        ...(statusFilter !== "ALL" && { accountStatus: statusFilter })
      };

      const response = await userService.getUsers(params);

      if (response.success) {
        setUsers(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, roleFilter, statusFilter, pageSize, searchQuery]);

  // Handle create user
  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      const response = await userService.deleteUser(deletingUser.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
  };

  // Toggle user expansion and fetch roles
  const toggleUserExpansion = async (userId: string) => {
    const newExpandedUsers = new Set(expandedUsers);
    
    if (expandedUsers.has(userId)) {
      // Collapse
      newExpandedUsers.delete(userId);
      setExpandedUsers(newExpandedUsers);
    } else {
      // Expand
      newExpandedUsers.add(userId);
      setExpandedUsers(newExpandedUsers);
      
      // Fetch roles if not already loaded
      if (!userRoles[userId]) {
        setLoadingUserRoles(prev => new Set(prev).add(userId));
        try {
          const response = await userService.getUserRoles(userId);
          if (response.success && response.data) {
            setUserRoles(prev => ({
              ...prev,
              [userId]: response.data || []
            }));
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: "Failed to load user roles",
            variant: "destructive",
          });
        } finally {
          setLoadingUserRoles(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }
      }
    }
  };

  // Handle open add roles dialog
  const handleOpenAddRoles = async (user: User) => {
    setSelectedUserForRoles(user);
    setSelectedRoleIds([]);
    setAllRoles([]);
    setRolesPage(0);
    setHasMoreRoles(true);
    setRoleSearchQuery('');
    setShowAddRoles(true);
    
    // Fetch first page of roles
    await fetchRolesPage(0);
  };

  // Fetch roles page
  const fetchRolesPage = async (page: number) => {
    if (page === 0) {
      setLoadingAllRoles(true);
    } else {
      setLoadingMoreRoles(true);
    }
    
    try {
      const response = await roleService.getRoles({
        page,
        size: 20,
        ...(roleSearchQuery && { search: roleSearchQuery })
      });
      
      if (response.success) {
        const rolesData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || [];
        const totalPages = Array.isArray(response.data) 
          ? 1 
          : response.data.totalPages || 1;
        
        setAllRoles(prev => page === 0 ? rolesData : [...prev, ...rolesData]);
        setRolesTotalPagesDialog(totalPages);
        setRolesPage(page);
        setHasMoreRoles(page + 1 < totalPages);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setLoadingAllRoles(false);
      setLoadingMoreRoles(false);
    }
  };

  // Handle scroll to load more roles
  const handleRolesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (hasMoreRoles && !loadingMoreRoles && !loadingAllRoles) {
        fetchRolesPage(rolesPage + 1);
      }
    }
  };

  // Handle role search with debounce
  useEffect(() => {
    if (!showAddRoles) return;
    
    const timer = setTimeout(() => {
      setAllRoles([]);
      setRolesPage(0);
      setHasMoreRoles(true);
      fetchRolesPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [roleSearchQuery]);

  // Handle role selection
  const toggleRoleSelection = (roleId: string) => {
    setSelectedRoleIds(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  // Handle add roles submit
  const handleAddRoles = async () => {
    if (!selectedUserForRoles || selectedRoleIds.length === 0) return;

    setAddingRoles(true);
    try {
      const response = await userService.assignRolesToUser(
        selectedUserForRoles.id,
        selectedRoleIds
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Roles assigned successfully",
        });
        
        // Refresh user roles if expanded
        if (expandedUsers.has(selectedUserForRoles.id)) {
          const rolesResponse = await userService.getUserRoles(selectedUserForRoles.id);
          if (rolesResponse.success) {
            setUserRoles(prev => ({
              ...prev,
              [selectedUserForRoles.id]: rolesResponse.data || []
            }));
          }
        }
        
        // Refresh users list
        fetchUsers();
        
        // Close dialog
        setShowAddRoles(false);
        setSelectedUserForRoles(null);
        setSelectedRoleIds([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign roles",
        variant: "destructive",
      });
    } finally {
      setAddingRoles(false);
    }
  };

  // Handle remove role from user
  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      const response = await userService.removeRoleFromUser(userId, roleId);

      if (response.success) {
        toast({
          title: "Success",
          description: "Role removed successfully",
        });
        
        // Update user roles in state
        setUserRoles(prev => ({
          ...prev,
          [userId]: (prev[userId] || []).filter(r => r.id !== roleId)
        }));
        
        // Refresh users list
        fetchUsers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove role",
        variant: "destructive",
      });
    } finally {
      setDeletingRole(null);
    }
  };

  // Handle toggle user status
  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const response = await userService.toggleUserStatus(user.id, newStatus);
      
      if (response.success) {
        toast({
          title: "Success",
          description: `User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
        });
        fetchUsers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen pb-8">
      <Header title="User Management" subtitle="Manage system users and permissions" />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-4 bg-gradient-to-br from-primary/10 to-primary/5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{totalElements}</p>
              </div>
              <UserIcon className="w-10 h-10 text-primary opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated p-4 bg-gradient-to-br from-green-500/10 to-green-500/5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.accountStatus === 'ACTIVE').length}
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elevated p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.roles.some(r => r.name === 'ADMIN' || r.name === 'SUPER_ADMIN')).length}
                </p>
              </div>
              <Shield className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elevated p-4 bg-gradient-to-br from-red-500/10 to-red-500/5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.accountStatus !== 'ACTIVE').length}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-elevated p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by first name, last name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Role Filter */}
            {/* <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select> */}

            {/* Status Filter */}
            {/* <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select> */}

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleCreateUser}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-elevated overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading users...</p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <UserIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, index) => {
                    const fullName = `${user.firstName} ${user.lastName}`;
                    const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
                    const primaryRole = user.roles[0]?.name || 'USER';
                    const isActive = user.accountStatus === 'ACTIVE';
                    const isExpanded = expandedUsers.has(user.id);
                    const roles = userRoles[user.id] || [];
                    const isLoadingRoles = loadingUserRoles.has(user.id);
                    
                    return (
                    <React.Fragment key={user.id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserExpansion(user.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-navy-light flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {initials}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-foreground">{user.email}</span>
                          </div>
                          {user.mobile && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{user.mobile}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={primaryRole.includes('ADMIN') ? 'default' : 'secondary'}
                          className={primaryRole.includes('ADMIN') ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : ''}
                        >
                          {primaryRole.includes('ADMIN') ? (
                            <Shield className="w-3 h-3 mr-1" />
                          ) : (
                            <UserIcon className="w-3 h-3 mr-1" />
                          )}
                          {primaryRole}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(user.lastLogin)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                              {isActive ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingUser(user)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Roles Row */}
                    {isExpanded && (
                      <TableRow className="bg-secondary/30">
                        <TableCell colSpan={8} className="py-4">
                          <div className="pl-16">
                            {isLoadingRoles ? (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading roles...</span>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Assigned Roles ({roles.length})
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenAddRoles(user)}
                                  >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Role
                                  </Button>
                                </div>
                                
                                {roles.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {roles.map((role) => (
                                      <div
                                        key={role.id}
                                        className="flex items-start gap-2 p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
                                      >
                                        <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-foreground">
                                            {role.name}
                                          </p>
                                          {role.description && (
                                            <p className="text-xs text-muted-foreground truncate">
                                              {role.description}
                                            </p>
                                          )}
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                          onClick={() => setDeletingRole({ userId: user.id, roleId: role.id })}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">
                                    No roles assigned to this user
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} users
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
                    <SelectTrigger className="w-20">
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
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* User Form Dialog */}
      <UserFormDialog
        open={showUserForm}
        onOpenChange={setShowUserForm}
        user={editingUser}
        onSuccess={fetchUsers}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingUser?.firstName} {deletingUser?.lastName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Roles Dialog */}
      <Dialog open={showAddRoles} onOpenChange={setShowAddRoles}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Roles to {selectedUserForRoles?.firstName} {selectedUserForRoles?.lastName}</DialogTitle>
            <DialogDescription>
              Select roles to assign to this user. You can select multiple roles.
            </DialogDescription>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative px-6">
            <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search roles by name or description..."
              value={roleSearchQuery}
              onChange={(e) => setRoleSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div 
            className="flex-1 overflow-y-auto py-4" 
            onScroll={handleRolesScroll}
          >
            {loadingAllRoles ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading roles...</span>
              </div>
            ) : allRoles.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No roles available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allRoles.map((role) => {
                  const isAlreadyAssigned = userRoles[selectedUserForRoles?.id || '']?.some(
                    (r) => r.id === role.id
                  );
                  
                  return (
                    <div
                      key={role.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        isAlreadyAssigned
                          ? 'bg-muted/50 border-muted opacity-60'
                          : selectedRoleIds.includes(role.id)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-background border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        id={role.id}
                        checked={selectedRoleIds.includes(role.id)}
                        onCheckedChange={() => toggleRoleSelection(role.id)}
                        disabled={isAlreadyAssigned}
                        className="mt-1"
                      />
                      <label
                        htmlFor={role.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-foreground">
                            {role.name}
                          </p>
                          {isAlreadyAssigned && (
                            <Badge variant="default" className="text-xs">
                              Already Assigned
                            </Badge>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-xs text-muted-foreground">
                            {role.description}
                          </p>
                        )}
                      </label>
                    </div>
                  );
                })}
                
                {/* Loading more indicator */}
                {loadingMoreRoles && (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading more roles...</span>
                  </div>
                )}
                
                {/* End of list indicator */}
                {!hasMoreRoles && allRoles.length > 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    All roles loaded ({allRoles.length} total)
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                {selectedRoleIds.length} role(s) selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddRoles(false)}
                  disabled={addingRoles}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddRoles}
                  disabled={selectedRoleIds.length === 0 || addingRoles}
                >
                  {addingRoles ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Roles
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation Dialog */}
      <AlertDialog 
        open={!!deletingRole} 
        onOpenChange={() => setDeletingRole(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this role from the user? This action will affect the user's permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deletingRole) {
                  handleRemoveRole(deletingRole.userId, deletingRole.roleId);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
