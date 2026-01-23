import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Shield, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { roleService } from "@/services/role.service";
import type { Role, Permission, CreateRoleRequest, UpdateRoleRequest } from "@/types/role";

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  permissionIds: string[];
}

const RoleFormDialog = ({ open, onOpenChange, role, onSuccess }: RoleFormDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const isEditing = !!role;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
    },
  });

  // Fetch all permissions
  const fetchAllPermissions = async () => {
    setPermissionsLoading(true);
    try {
      // Fetch with large page size to get all permissions
      const response = await roleService.getPermissions({ page: 0, size: 1000 });
      if (response.success) {
        // Handle case where data might be direct array or pageable object
        const permissionsData = Array.isArray(response.data) ? response.data : response.data.content || [];
        setAllPermissions(permissionsData);
      }
    } catch (error: any) {
      console.error('[RoleFormDialog] Error fetching permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
    } finally {
      setPermissionsLoading(false);
    }
  };

  // Reset form when dialog opens/closes or role changes
  useEffect(() => {
    if (open) {
      fetchAllPermissions();
      
      if (role) {
        const rolePermissionIds = role.permissions ? role.permissions.map(p => p.id) : [];
        reset({
          name: role.name,
          description: role.description,
          permissionIds: rolePermissionIds,
        });
        setSelectedPermissions(new Set(rolePermissionIds));
      } else {
        reset({
          name: "",
          description: "",
          permissionIds: [],
        });
        setSelectedPermissions(new Set());
      }
    }
  }, [open, role, reset]);

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

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        permissionIds: Array.from(selectedPermissions),
      };

      if (isEditing) {
        const response = await roleService.updateRole(role.id, payload);

        if (response.success) {
          toast({
            title: "Success",
            description: "Role updated successfully",
          });
          onSuccess();
          onOpenChange(false);
        }
      } else {
        const response = await roleService.createRole(payload);

        if (response.success) {
          toast({
            title: "Success",
            description: "Role created successfully",
          });
          onSuccess();
          onOpenChange(false);
        }
      }
    } catch (error: any) {
      console.error('[RoleFormDialog] Error saving role:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} role`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by category
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    const category = permission.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {isEditing ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update role information and assign permissions' 
              : 'Create a new role and assign permissions'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                placeholder="e.g., MANAGER, ACCOUNTANT"
                {...register("name", { 
                  required: "Role name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" }
                })}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the role and its responsibilities"
                rows={3}
                {...register("description", {
                  required: "Description is required",
                  minLength: { value: 10, message: "Description must be at least 10 characters" }
                })}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label>Permissions ({selectedPermissions.size} selected)</Label>
              <div className="border rounded-lg p-4 bg-secondary/5">
                {permissionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading permissions...</span>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {Object.keys(groupedPermissions).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No permissions available
                        </p>
                      ) : (
                        Object.entries(groupedPermissions).map(([category, permissions]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                              <Key className="w-4 h-4 text-primary" />
                              {category}
                            </h4>
                            <div className="space-y-2 ml-6">
                              {permissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-start space-x-2 p-2 rounded hover:bg-secondary/50 transition-colors"
                                >
                                  <Checkbox
                                    id={permission.id}
                                    checked={selectedPermissions.has(permission.id)}
                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                  />
                                  <div className="grid gap-1 leading-none flex-1">
                                    <label
                                      htmlFor={permission.id}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {permission.name}
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                      {permission.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Select the permissions that should be granted to this role
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || permissionsLoading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Role' : 'Create Role'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleFormDialog;
