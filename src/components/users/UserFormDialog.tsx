import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, User as UserIcon, Mail, Phone } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/user.service";
import type { User, CreateUserRequest, UpdateUserRequest, AccountStatus } from "@/types/user";
import { PasswordField } from "@/components/form/FormFields";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  roles: string[];
  password: string;
  confirmPassword: string;
  accountStatus: AccountStatus;
}

const UserFormDialog = ({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      roles: ["USER"],
      password: "",
      confirmPassword: "",
      accountStatus: "ACTIVE",
    },
  });

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (user) {
        const fullName = `${user.firstName} ${user.lastName}`.split(' ');
        reset({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile || "",
          roles: user.roles.map(r => r.name),
          password: "",
          confirmPassword: "",
          accountStatus: user.accountStatus,
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          roles: ["USER"],
          password: "",
          confirmPassword: "",
          accountStatus: "ACTIVE",
        });
      }
    }
  }, [open, user, reset]);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    // Validate passwords match
    if (!isEditing && data.password !== data.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Validate password for new users
    if (!isEditing && data.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        // Update existing user
        const updateData: UpdateUserRequest = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          mobile: data.mobile,
          roles: data.roles,
          accountStatus: data.accountStatus,
        };

        // Only include password if it's provided
        if (data.password) {
          if (data.password !== data.confirmPassword) {
            toast({
              title: "Error",
              description: "Passwords do not match",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          updateData.password = data.password;
        }

        const response = await userService.updateUser(user.id, updateData);

        if (response.success) {
          toast({
            title: "Success",
            description: "User updated successfully",
          });
          onSuccess();
          onOpenChange(false);
        }
      } else {
        // Create new user
        const createData: CreateUserRequest = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          mobile: data.mobile,
          password: data.password,
          roles: data.roles,
        };

        const response = await userService.createUser(createData);

        if (response.success) {
          toast({
            title: "Success",
            description: "User created successfully",
          });
          onSuccess();
          onOpenChange(false);
        }
      }
    } catch (error: any) {
      console.error('[UserFormDialog] Error saving user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} user`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update user information and permissions' 
              : 'Add a new user to the system'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="firstName"
                placeholder="John"
                className="pl-10"
                {...register("firstName", {
                  required: "First name is required",
                  minLength: { value: 2, message: "First name must be at least 2 characters" }
                })}
              />
            </div>
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="lastName"
                placeholder="Doe"
                className="pl-10"
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: { value: 2, message: "Last name must be at least 2 characters" }
                })}
              />
            </div>
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john.doe@company.com"
                className="pl-10"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="mobile"
                type="tel"
                placeholder="+91 9876543210"
                className="pl-10"
                {...register("mobile", {
                  required: "Mobile is required",
                  pattern: {
                    value: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
                    message: "Invalid mobile number"
                  }
                })}
              />
            </div>
            {errors.mobile && (
              <p className="text-sm text-red-600">{errors.mobile.message}</p>
            )}
          </div>

          {/* Role - Hidden for now, using default */}
          <input type="hidden" {...register("roles")} value="USER" />

          {/* Password */}
          <div className="space-y-2">
            <PasswordField
              name="password"
              label={isEditing ? "Password (Leave blank to keep current)" : "Password"}
              register={register}
              error={errors.password}
              required={!isEditing}
              placeholder={isEditing ? "Enter new password (optional)" : "Enter password"}
              showStrengthIndicator={!isEditing}
              helperText="Minimum 8 characters"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <PasswordField
              name="confirmPassword"
              label="Confirm Password"
              register={register}
              error={errors.confirmPassword}
              required={!isEditing}
              placeholder="Confirm password"
            />
          </div>

          {/* Active Status (only for editing) */}
          {isEditing && (
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <Label htmlFor="accountStatus" className="cursor-pointer">Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  {watch("accountStatus") === 'ACTIVE' ? "User can access the system" : "User is deactivated"}
                </p>
              </div>
              <Switch
                id="accountStatus"
                checked={watch("accountStatus") === 'ACTIVE'}
                onCheckedChange={(checked) => setValue("accountStatus", checked ? 'ACTIVE' : 'INACTIVE')}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update User' : 'Create User'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
