import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  Shield,
  Key,
  ArrowLeft,
  Save,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { roleService } from "@/services/role.service";
import type { Role, Permission } from "@/types/role";

const RolePermissions = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Fetch role details
  const fetchRole = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await roleService.getRoleById(id);
      if (response.success) {
        setRole(response.data);
        const permissionIds = response.data.permissions 
          ? response.data.permissions.map(p => p.id) 
          : [];
        setSelectedPermissions(new Set(permissionIds));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch role details",
        variant: "destructive",
      });
      navigate("/roles");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all permissions
  const fetchAllPermissions = async () => {
    try {
      const response = await roleService.getPermissions({ page: 0, size: 1000 });
      if (response.success) {
        const permissionsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || [];
        setAllPermissions(permissionsData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch permissions",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRole();
    fetchAllPermissions();
  }, [id]);

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  // Handle category select all
  const handleCategorySelectAll = (category: string, permissions: Permission[]) => {
    const categoryPermissionIds = permissions.map(p => p.id);
    const allSelected = categoryPermissionIds.every(id => selectedPermissions.has(id));

    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Deselect all in category
        categoryPermissionIds.forEach(id => newSet.delete(id));
      } else {
        // Select all in category
        categoryPermissionIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  // Save permissions
  const handleSave = async () => {
    if (!id || !role) return;

    setSaving(true);
    try {
      const response = await roleService.updateRole(id, {
        permissionIds: Array.from(selectedPermissions),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Permissions updated successfully",
        });
        fetchRole(); // Refresh role data
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update permissions",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Get unique categories
  const categories = ["ALL", ...new Set(allPermissions.map(p => p.category || "Other"))];

  // Filter permissions
  const filteredPermissions = allPermissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || 
                           (permission.category || "Other") === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group filtered permissions by category
  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const category = permission.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Calculate stats
  const totalPermissions = allPermissions.length;
  const assignedPermissions = selectedPermissions.size;
  const hasChanges = role && role.permissions 
    ? selectedPermissions.size !== role.permissions.length ||
      !role.permissions.every(p => selectedPermissions.has(p.id))
    : selectedPermissions.size > 0;

  if (loading) {
    return (
      <div className="min-h-screen pb-8">
        <Header title="Role Permissions" subtitle="Loading..." />
        <div className="flex items-center justify-center h-[60vh]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen pb-8">
        <Header title="Role Permissions" subtitle="Role not found" />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-muted-foreground mb-4">Role not found</p>
          <Button onClick={() => navigate("/roles")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Header 
        title={`${role.name} Permissions`} 
        subtitle="Manage permissions assigned to this role" 
      />

      <div className="p-6">
        {/* Back Button and Save */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate("/roles")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>

          <Button 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-navy-light flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="text-lg font-bold text-foreground">{role.name}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-lg font-bold text-foreground">{assignedPermissions} / {totalPermissions}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elevated p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-lg font-bold text-foreground">{categories.length - 1}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Role Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Role Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{role.description}</p>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Permissions</CardTitle>
            <CardDescription>Search and filter permissions by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={categoryFilter === category ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Available Permissions</span>
              {hasChanges && (
                <Badge variant="secondary" className="animate-pulse">
                  Unsaved Changes
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Select permissions to assign to this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Key className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No permissions found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, permissions]) => {
                    const categoryPermissionIds = permissions.map(p => p.id);
                    const allSelected = categoryPermissionIds.every(id => selectedPermissions.has(id));
                    const someSelected = categoryPermissionIds.some(id => selectedPermissions.has(id));
                    const selectedCount = categoryPermissionIds.filter(id => selectedPermissions.has(id)).length;

                    return (
                      <div key={category} className="space-y-3">
                        {/* Category Header */}
                        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={() => handleCategorySelectAll(category, permissions)}
                              className="data-[state=checked]:bg-primary"
                            />
                            <div>
                              <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <Key className="w-4 h-4 text-primary" />
                                {category}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {selectedCount} of {permissions.length} selected
                              </p>
                            </div>
                          </div>
                          <Badge variant={allSelected ? "default" : someSelected ? "secondary" : "outline"}>
                            {permissions.length}
                          </Badge>
                        </div>

                        {/* Permissions in Category */}
                        <div className="space-y-2 ml-4 pl-4 border-l-2 border-secondary">
                          {permissions.map((permission) => {
                            const isSelected = selectedPermissions.has(permission.id);
                            
                            return (
                              <div
                                key={permission.id}
                                className={`
                                  flex items-start gap-3 p-3 rounded-lg transition-all
                                  ${isSelected 
                                    ? 'bg-primary/10 border border-primary/30' 
                                    : 'bg-secondary/5 hover:bg-secondary/20 border border-transparent'
                                  }
                                `}
                              >
                                <Checkbox
                                  id={permission.id}
                                  checked={isSelected}
                                  onCheckedChange={() => handlePermissionToggle(permission.id)}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <label
                                    htmlFor={permission.id}
                                    className="font-medium text-sm text-foreground cursor-pointer block"
                                  >
                                    {permission.name}
                                  </label>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {permission.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {permission.id.slice(0, 8)}...
                                    </Badge>
                                    {isSelected && (
                                      <Badge variant="default" className="text-xs">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Assigned
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
            size="lg"
            className="min-w-[200px]"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : hasChanges ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save {selectedPermissions.size} Permissions
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                All Changes Saved
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
