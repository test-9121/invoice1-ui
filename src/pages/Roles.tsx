import { useState, useEffect } from "react";
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
  Settings
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
  const [rolesPageSize] = useState(10);
  
  // Permissions state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissionsSearchQuery, setPermissionsSearchQuery] = useState("");
  const [permissionsCurrentPage, setPermissionsCurrentPage] = useState(0);
  const [permissionsTotalPages, setPermissionsTotalPages] = useState(0);
  const [permissionsTotalElements, setPermissionsTotalElements] = useState(0);
  const [permissionsPageSize] = useState(10);
  
  // Dialog states
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

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
    if (activeTab === "roles") {
      fetchRoles();
    } else {
      fetchPermissions();
    }
  }, [activeTab, rolesCurrentPage, permissionsCurrentPage]);

  // Search handlers with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (rolesCurrentPage === 0) {
        fetchRoles();
      } else {
        setRolesCurrentPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [rolesSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (permissionsCurrentPage === 0) {
        fetchPermissions();
      } else {
        setPermissionsCurrentPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [permissionsSearchQuery]);

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
                      placeholder="Search roles..."
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
                        roles.map((role) => (
                          <TableRow key={role.id}>
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
                                        {perm.name}
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {rolesTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {rolesCurrentPage * rolesPageSize + 1} to {Math.min((rolesCurrentPage + 1) * rolesPageSize, rolesTotalElements)} of {rolesTotalElements} roles
                    </p>
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
                {permissionsTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {permissionsCurrentPage * permissionsPageSize + 1} to {Math.min((permissionsCurrentPage + 1) * permissionsPageSize, permissionsTotalElements)} of {permissionsTotalElements} permissions
                    </p>
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
    </div>
  );
};

export default Roles;
