import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  Key,
  Lock,
  UserCog,
  Settings,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  X
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { roleService } from "@/services/role.service";
import type { Role, Permission } from "@/types/role";
import RoleFormDialog from "@/components/roles/RoleFormDialog";

const Roles = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("roles");
  
  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesSearchQuery, setRolesSearchQuery] = useState("");
  const [rolesCurrentPage, setRolesCurrentPage] = useState(0);
  const [rolesTotalPages, setRolesTotalPages] = useState(0);
  const [rolesTotalElements, setRolesTotalElements] = useState(0);
  const [rolesPageSize, setRolesPageSize] = useState(10);
  
  // Permissions state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissionsSearchQuery, setPermissionsSearchQuery] = useState("");
  const [permissionsCurrentPage, setPermissionsCurrentPage] = useState(0);
  const [permissionsTotalPages, setPermissionsTotalPages] = useState(0);
  const [permissionsTotalElements, setPermissionsTotalElements] = useState(0);
  const [permissionsPageSize, setPermissionsPageSize] = useState(10);
  
  // Dialog states
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  
  // Add permissions dialog states
  const [showAddPermissions, setShowAddPermissions] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [loadingAllPermissions, setLoadingAllPermissions] = useState(false);
  const [addingPermissions, setAddingPermissions] = useState(false);
  const [permissionsPage, setPermissionsPage] = useState(0);
  const [permissionsTotalPagesDialog, setPermissionsTotalPagesDialog] = useState(0);
  const [hasMorePermissions, setHasMorePermissions] = useState(true);
  const [loadingMorePermissions, setLoadingMorePermissions] = useState(false);
  const [permissionSearchQuery, setPermissionSearchQuery] = useState('');
  
  // Expanded roles state
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [rolePermissions, setRolePermissions] = useState<Record<string, Permission[]>>({});
  const [loadingPermissions, setLoadingPermissions] = useState<Set<string>>(new Set());
  const [deletingPermission, setDeletingPermission] = useState<{ roleId: string; permissionId: string } | null>(null);

  // Fetch roles
  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const params = {
        page: rolesCurrentPage,
        size: rolesPageSize,
        ...(rolesSearchQuery && { search: rolesSearchQuery })
      };

      const response = await roleService.getRoles(params);

      if (response.success) {
        // Handle case where data might be direct array or pageable object
        const rolesData = Array.isArray(response.data) ? response.data : response.data.content || [];
        const totalPages = Array.isArray(response.data) ? 1 : response.data.totalPages || 1;
        const totalElements = Array.isArray(response.data) ? response.data.length : response.data.totalElements || 0;
        
        setRoles(rolesData);
        setRolesTotalPages(totalPages);
        setRolesTotalElements(totalElements);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch roles",
        variant: "destructive",
      });
    } finally {
      setRolesLoading(false);
    }
  };

  // Fetch permissions
  const fetchPermissions = async () => {
    setPermissionsLoading(true);
    try {
      const params = {
        page: permissionsCurrentPage,
        size: permissionsPageSize,
        ...(permissionsSearchQuery && { search: permissionsSearchQuery })
      };

      const response = await roleService.getPermissions(params);

      if (response.success) {
        // Handle case where data might be direct array or pageable object
        const permissionsData = Array.isArray(response.data) ? response.data : response.data.content || [];
        const totalPages = Array.isArray(response.data) ? 1 : response.data.totalPages || 1;
        const totalElements = Array.isArray(response.data) ? response.data.length : response.data.totalElements || 0;
        
        setPermissions(permissionsData);
        setPermissionsTotalPages(totalPages);
        setPermissionsTotalElements(totalElements);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch permissions",
        variant: "destructive",
      });
    } finally {
      setPermissionsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "roles") {
        fetchRoles();
      } else {
        fetchPermissions();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, rolesCurrentPage, permissionsCurrentPage, rolesPageSize, permissionsPageSize, rolesSearchQuery, permissionsSearchQuery]);

  // Handle create role
  const handleCreateRole = () => {
    setEditingRole(null);
    setShowRoleForm(true);
  };

  // Handle edit role
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowRoleForm(true);
  };

  // Handle delete role
  const handleDeleteRole = async () => {
    if (!deletingRole) return;

    try {
      const response = await roleService.deleteRole(deletingRole.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Role deleted successfully",
        });
        fetchRoles();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete role",
        variant: "destructive",
      });
    } finally {
      setDeletingRole(null);
    }
  };

  // Toggle role expansion and fetch permissions
  const toggleRoleExpansion = async (roleId: string) => {
    const newExpandedRoles = new Set(expandedRoles);
    
    if (expandedRoles.has(roleId)) {
      // Collapse
      newExpandedRoles.delete(roleId);
      setExpandedRoles(newExpandedRoles);
    } else {
      // Expand
      newExpandedRoles.add(roleId);
      setExpandedRoles(newExpandedRoles);
      
      // Fetch permissions if not already loaded
      if (!rolePermissions[roleId]) {
        setLoadingPermissions(prev => new Set(prev).add(roleId));
        try {
          const response = await roleService.getRolePermissions(roleId);
          if (response.success && response.data) {
            setRolePermissions(prev => ({
              ...prev,
              [roleId]: response.data || []
            }));
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: "Failed to load role permissions",
            variant: "destructive",
          });
        } finally {
          setLoadingPermissions(prev => {
            const newSet = new Set(prev);
            newSet.delete(roleId);
            return newSet;
          });
        }
      }
    }
  };

  // Handle open add permissions dialog
  const handleOpenAddPermissions = async (role: Role) => {
    setSelectedRoleForPermissions(role);
    setSelectedPermissionIds([]);
    setAllPermissions([]);
    setPermissionsPage(0);
    setHasMorePermissions(true);
    setPermissionSearchQuery('');
    setShowAddPermissions(true);
    
    // Fetch first page of permissions
    await fetchPermissionsPage(0);
  };

  // Fetch permissions page
  const fetchPermissionsPage = async (page: number) => {
    if (page === 0) {
      setLoadingAllPermissions(true);
    } else {
      setLoadingMorePermissions(true);
    }
    
    try {
      const response = await roleService.getPermissions({
        page,
        size: 20,
        ...(permissionSearchQuery && { search: permissionSearchQuery })
      });
      
      if (response.success) {
        const permissionsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || [];
        const totalPages = Array.isArray(response.data) 
          ? 1 
          : response.data.totalPages || 1;
        
        setAllPermissions(prev => page === 0 ? permissionsData : [...prev, ...permissionsData]);
        setPermissionsTotalPagesDialog(totalPages);
        setPermissionsPage(page);
        setHasMorePermissions(page + 1 < totalPages);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
    } finally {
      setLoadingAllPermissions(false);
      setLoadingMorePermissions(false);
    }
  };

  // Handle scroll to load more permissions
  const handlePermissionsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Check if scrolled to bottom (with 50px threshold)
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (hasMorePermissions && !loadingMorePermissions && !loadingAllPermissions) {
        fetchPermissionsPage(permissionsPage + 1);
      }
    }
  };

  // Handle permission search with debounce
  useEffect(() => {
    if (!showAddPermissions) return;
    
    const timer = setTimeout(() => {
      setAllPermissions([]);
      setPermissionsPage(0);
      setHasMorePermissions(true);
      fetchPermissionsPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [permissionSearchQuery]);

  // Handle permission selection
  const togglePermissionSelection = (permissionId: string) => {
    setSelectedPermissionIds(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Handle add permissions submit
  const handleAddPermissions = async () => {
    if (!selectedRoleForPermissions || selectedPermissionIds.length === 0) return;

    setAddingPermissions(true);
    try {
      const response = await roleService.addPermissionsToRole(
        selectedRoleForPermissions.id,
        selectedPermissionIds
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Permissions added successfully",
        });
        
        // Refresh role permissions if expanded
        if (expandedRoles.has(selectedRoleForPermissions.id)) {
          const permResponse = await roleService.getRolePermissions(selectedRoleForPermissions.id);
          if (permResponse.success) {
            setRolePermissions(prev => ({
              ...prev,
              [selectedRoleForPermissions.id]: permResponse.data || []
            }));
          }
        }
        
        // Refresh roles list
        fetchRoles();
        
        // Close dialog
        setShowAddPermissions(false);
        setSelectedRoleForPermissions(null);
        setSelectedPermissionIds([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add permissions",
        variant: "destructive",
      });
    } finally {
      setAddingPermissions(false);
    }
  };

  // Handle remove permission from role
  const handleRemovePermission = async (roleId: string, permissionId: string) => {
    try {
      const response = await roleService.removePermissionFromRole(roleId, permissionId);

      if (response.success) {
        toast({
          title: "Success",
          description: "Permission removed successfully",
        });
        
        // Update role permissions in state
        setRolePermissions(prev => ({
          ...prev,
          [roleId]: (prev[roleId] || []).filter(p => p.id !== permissionId)
        }));
        
        // Refresh roles list
        fetchRoles();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove permission",
        variant: "destructive",
      });
    } finally {
      setDeletingPermission(null);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pb-8">
      <Header title="Roles & Permissions" subtitle="Manage system roles and permissions" />

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
                <p className="text-sm text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-bold text-foreground">{rolesTotalElements}</p>
              </div>
              <Shield className="w-10 h-10 text-primary opacity-50" />
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
                <p className="text-sm text-muted-foreground">Total Permissions</p>
                <p className="text-2xl font-bold text-foreground">{permissionsTotalElements}</p>
              </div>
              <Key className="w-10 h-10 text-orange-500 opacity-50" />
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
                <p className="text-sm text-muted-foreground">System Roles</p>
                <p className="text-2xl font-bold text-foreground">
                  {roles.filter(r => r.name.includes('ADMIN')).length}
                </p>
              </div>
              <UserCog className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="roles" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Roles
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Permissions
                </TabsTrigger>
              </TabsList>
              
              {activeTab === "permissions" && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/permissions")}
                  className="hidden md:flex"
                >
                  <Key className="w-4 h-4 mr-2" />
                  View All Permissions
                </Button>
              )}
            </div>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-4">
              {/* Filters and Actions */}
              <div className="card-elevated p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search role name or description..."
                      value={rolesSearchQuery}
                      onChange={(e) => setRolesSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchRoles} disabled={rolesLoading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${rolesLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button onClick={handleCreateRole}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Role
                    </Button>
                  </div>
                </div>
              </div>

              {/* Roles Table */}
              <div className="card-elevated overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rolesLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <p className="text-muted-foreground">Loading roles...</p>
                          </TableCell>
                        </TableRow>
                      ) : roles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Shield className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground">No roles found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        roles.map((role) => {
                          const isExpanded = expandedRoles.has(role.id);
                          const permissions = rolePermissions[role.id] || [];
                          const isLoadingPerms = loadingPermissions.has(role.id);
                          
                          return (
                            <React.Fragment key={role.id}>
                              <TableRow>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleRoleExpansion(role.id)}
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
                                      <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">{role.name}</p>
                                      <p className="text-xs text-muted-foreground">{role.id.slice(0, 8)}...</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm text-foreground max-w-md">{role.description}</p>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {role.permissions && role.permissions.length > 0 ? (
                                      <>
                                        {role.permissions.slice(0, 3).map((perm) => (
                                          <Badge key={perm.id} variant="secondary" className="text-xs">
                                            {perm.name || `${perm.module}:${perm.action}`}
                                          </Badge>
                                        ))}
                                        {role.permissions.length > 3 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{role.permissions.length - 3} more
                                          </Badge>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">No permissions</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm text-muted-foreground">{formatDate(role.createdAt)}</p>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => navigate(`/roles/${role.id}/permissions`)}>
                                        <Settings className="w-4 h-4 mr-2" />
                                        Manage Permissions
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Role
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => setDeletingRole(role)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Role
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                              
                              {/* Expanded Permissions Row */}
                              {isExpanded && (
                                <TableRow className="bg-secondary/30">
                                  <TableCell colSpan={6} className="py-4">
                                    <div className="pl-16">
                                      {isLoadingPerms ? (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <RefreshCw className="w-4 h-4 animate-spin" />
                                          <span className="text-sm">Loading permissions...</span>
                                        </div>
                                      ) : (
                                        <div className="space-y-3">
                                          <div className="flex items-center justify-between">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                              Assigned Permissions ({permissions.length})
                                            </p>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleOpenAddPermissions(role)}
                                            >
                                              <PlusCircle className="w-4 h-4 mr-2" />
                                              Add Permission
                                            </Button>
                                          </div>
                                          
                                          {permissions.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                              {permissions.map((perm) => (
                                                <div
                                                  key={perm.id}
                                                  className="flex items-start gap-2 p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
                                                >
                                                  <Key className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                  <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <Badge variant="secondary" className="text-xs font-mono">
                                                        {perm.module}
                                                      </Badge>
                                                      <Badge variant="outline" className="text-xs">
                                                        {perm.action}
                                                      </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                      {perm.description}
                                                    </p>
                                                    <p className="text-xs font-mono text-muted-foreground/70">
                                                      {perm.permissionString}
                                                    </p>
                                                  </div>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                                    onClick={() => setDeletingPermission({ roleId: role.id, permissionId: perm.id })}
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="text-sm text-muted-foreground italic">
                                              No permissions assigned to this role
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
                {rolesTotalPages > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {rolesCurrentPage * rolesPageSize + 1} to {Math.min((rolesCurrentPage + 1) * rolesPageSize, rolesTotalElements)} of {rolesTotalElements} roles
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows per page:</span>
                        <Select
                          value={rolesPageSize.toString()}
                          onValueChange={(value) => {
                            setRolesPageSize(Number(value));
                            setRolesCurrentPage(0);
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
                        onClick={() => setRolesCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={rolesCurrentPage === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRolesCurrentPage(prev => Math.min(rolesTotalPages - 1, prev + 1))}
                        disabled={rolesCurrentPage >= rolesTotalPages - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-4">
              {/* Filters and Actions */}
              <div className="card-elevated p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search permissions..."
                      value={permissionsSearchQuery}
                      onChange={(e) => setPermissionsSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchPermissions} disabled={permissionsLoading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${permissionsLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>

              {/* Permissions Table */}
              <div className="card-elevated overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissionsLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <p className="text-muted-foreground">Loading permissions...</p>
                          </TableCell>
                        </TableRow>
                      ) : permissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <Key className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground">No permissions found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                  <Lock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{permission.name}</p>
                                  <p className="text-xs text-muted-foreground">{permission.id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-foreground max-w-md">{permission.description}</p>
                            </TableCell>
                            <TableCell>
                              {permission.category ? (
                                <Badge variant="outline">{permission.category}</Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">Uncategorized</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-muted-foreground">{formatDate(permission.createdAt)}</p>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {/* Pagination */}
                {permissionsTotalPages > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {permissionsCurrentPage * permissionsPageSize + 1} to {Math.min((permissionsCurrentPage + 1) * permissionsPageSize, permissionsTotalElements)} of {permissionsTotalElements} permissions
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows per page:</span>
                        <Select
                          value={permissionsPageSize.toString()}
                          onValueChange={(value) => {
                            setPermissionsPageSize(Number(value));
                            setPermissionsCurrentPage(0);
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
                        onClick={() => setPermissionsCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={permissionsCurrentPage === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPermissionsCurrentPage(prev => Math.min(permissionsTotalPages - 1, prev + 1))}
                        disabled={permissionsCurrentPage >= permissionsTotalPages - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Role Form Dialog */}
      <RoleFormDialog
        open={showRoleForm}
        onOpenChange={setShowRoleForm}
        role={editingRole}
        onSuccess={fetchRoles}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingRole?.name}</strong>? This action cannot be undone and will affect all users assigned to this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Permissions Dialog */}
      <Dialog open={showAddPermissions} onOpenChange={setShowAddPermissions}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Permissions to {selectedRoleForPermissions?.name}</DialogTitle>
            <DialogDescription>
              Select permissions to add to this role. You can select multiple permissions.
            </DialogDescription>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative px-6">
            <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions by module, action or description..."
              value={permissionSearchQuery}
              onChange={(e) => setPermissionSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div 
            className="flex-1 overflow-y-auto py-4" 
            onScroll={handlePermissionsScroll}
          >
            {loadingAllPermissions ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading permissions...</span>
              </div>
            ) : allPermissions.length === 0 ? (
              <div className="text-center py-8">
                <Key className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No permissions available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Group permissions by module */}
                {Object.entries(
                  allPermissions.reduce((acc, perm) => {
                    const module = perm.module || 'Other';
                    if (!acc[module]) acc[module] = [];
                    acc[module].push(perm);
                    return acc;
                  }, {} as Record<string, Permission[]>)
                ).map(([module, perms]) => (
                  <div key={module} className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider bg-background py-2 border-b">
                      {module}
                    </h3>
                    <div className="space-y-2 pl-4">
                      {perms.map((perm) => {
                        const isAlreadyAssigned = rolePermissions[selectedRoleForPermissions?.id || '']?.some(
                          (p) => p.id === perm.id
                        );
                        
                        return (
                          <div
                            key={perm.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                              isAlreadyAssigned
                                ? 'bg-muted/50 border-muted opacity-60'
                                : selectedPermissionIds.includes(perm.id)
                                ? 'bg-primary/10 border-primary'
                                : 'bg-background border-border hover:border-primary/50'
                            }`}
                          >
                            <Checkbox
                              id={perm.id}
                              checked={selectedPermissionIds.includes(perm.id)}
                              onCheckedChange={() => togglePermissionSelection(perm.id)}
                              disabled={isAlreadyAssigned}
                              className="mt-1"
                            />
                            <label
                              htmlFor={perm.id}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs font-mono">
                                  {perm.module}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {perm.action}
                                </Badge>
                                {isAlreadyAssigned && (
                                  <Badge variant="default" className="text-xs">
                                    Already Assigned
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-foreground font-medium">
                                {perm.description}
                              </p>
                              <p className="text-xs font-mono text-muted-foreground mt-1">
                                {perm.permissionString}
                              </p>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Loading more indicator */}
                {loadingMorePermissions && (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading more permissions...</span>
                  </div>
                )}
                
                {/* End of list indicator */}
                {!hasMorePermissions && allPermissions.length > 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    All permissions loaded ({allPermissions.length} total)
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                {selectedPermissionIds.length} permission(s) selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddPermissions(false)}
                  disabled={addingPermissions}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPermissions}
                  disabled={selectedPermissionIds.length === 0 || addingPermissions}
                >
                  {addingPermissions ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Permissions
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Confirmation Dialog */}
      <AlertDialog 
        open={!!deletingPermission} 
        onOpenChange={() => setDeletingPermission(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this permission from the role? This action will affect all users assigned to this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deletingPermission) {
                  handleRemovePermission(deletingPermission.roleId, deletingPermission.permissionId);
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

export default Roles;
