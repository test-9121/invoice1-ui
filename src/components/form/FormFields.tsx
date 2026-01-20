// Reusable Form Field Components with Best Practices
// Includes: validation, accessibility, TypeScript support, and consistent styling

import React from "react";
import { UseFormRegister, FieldError, FieldValues, Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

// ============================================================================
// Base Field Props
// ============================================================================

interface BaseFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  showSuccessState?: boolean;
}

// ============================================================================
// Text Input Field
// ============================================================================

interface TextFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  register: UseFormRegister<T>;
  type?: "text" | "email" | "tel" | "url" | "number";
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  pattern?: string;
  icon?: React.ReactNode;
}

export function TextField<T extends FieldValues>({
  name,
  label,
  register,
  error,
  required = false,
  disabled = false,
  type = "text",
  placeholder,
  autoComplete,
  maxLength,
  pattern,
  icon,
  className,
  helperText,
  showSuccessState = false,
}: TextFieldProps<T>) {
  const hasError = !!error;
  const isValid = !hasError && showSuccessState;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <Input
          id={name}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={cn(
            icon && "pl-10",
            hasError && "border-red-500 focus-visible:ring-red-500",
            isValid && "border-green-500 focus-visible:ring-green-500",
            "transition-colors"
          )}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${name}-error` : helperText ? `${name}-helper` : undefined
          }
          {...register(name, {
            ...(pattern && { pattern: { value: new RegExp(pattern), message: "Invalid format" } }),
            ...(maxLength && { maxLength: { value: maxLength, message: `Maximum ${maxLength} characters` } }),
          })}
        />

        {/* Success/Error Icon */}
        {(hasError || isValid) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p id={`${name}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id={`${name}-error`} className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error.message}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Password Field
// ============================================================================

interface PasswordFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  register: UseFormRegister<T>;
  placeholder?: string;
  autoComplete?: string;
  showStrengthIndicator?: boolean;
}

export function PasswordField<T extends FieldValues>({
  name,
  label,
  register,
  error,
  required = false,
  disabled = false,
  placeholder,
  autoComplete = "current-password",
  showStrengthIndicator = false,
  className,
  helperText,
}: PasswordFieldProps<T>) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState("");

  const getPasswordStrength = (pwd: string): { level: number; label: string; color: string } => {
    if (!pwd) return { level: 0, label: "", color: "" };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    const levels = [
      { level: 0, label: "Very Weak", color: "bg-red-500" },
      { level: 1, label: "Weak", color: "bg-orange-500" },
      { level: 2, label: "Fair", color: "bg-yellow-500" },
      { level: 3, label: "Good", color: "bg-blue-500" },
      { level: 4, label: "Strong", color: "bg-green-500" },
      { level: 5, label: "Very Strong", color: "bg-green-600" },
    ];

    return levels[strength];
  };

  const strength = showStrengthIndicator ? getPasswordStrength(password) : null;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={name}
          type={showPassword ? "text" : "password"}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            "pr-10",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          aria-invalid={!!error}
          {...register(name, {
            onChange: (e) => setPassword(e.target.value),
          })}
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {showStrengthIndicator && password && strength && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  level <= strength.level ? strength.color : "bg-gray-200"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Strength: <span className="font-medium">{strength.label}</span>
          </p>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error.message}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Textarea Field
// ============================================================================

interface TextareaFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  register: UseFormRegister<T>;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

export function TextareaField<T extends FieldValues>({
  name,
  label,
  register,
  error,
  required = false,
  disabled = false,
  placeholder,
  rows = 4,
  maxLength,
  showCharCount = false,
  className,
  helperText,
}: TextareaFieldProps<T>) {
  const [charCount, setCharCount] = React.useState(0);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Textarea
        id={name}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          error && "border-red-500 focus-visible:ring-red-500",
          "resize-none"
        )}
        aria-invalid={!!error}
        {...register(name, {
          ...(maxLength && { maxLength: { value: maxLength, message: `Maximum ${maxLength} characters` } }),
          onChange: (e) => setCharCount(e.target.value.length),
        })}
      />

      {/* Character Count */}
      {showCharCount && maxLength && (
        <p className="text-xs text-muted-foreground text-right">
          {charCount} / {maxLength}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error.message}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Select Field
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  options: SelectOption[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  error,
  required = false,
  disabled = false,
  placeholder = "Select an option",
  value,
  onChange,
  className,
  helperText,
}: SelectFieldProps<T>) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={name}
          className={cn(
            error && "border-red-500 focus:ring-red-500"
          )}
          aria-invalid={!!error}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error.message}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Checkbox Field
// ============================================================================

interface CheckboxFieldProps {
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: FieldError;
  disabled?: boolean;
  className?: string;
  helperText?: string;
}

export function CheckboxField({
  name,
  label,
  checked,
  onChange,
  error,
  disabled = false,
  className,
  helperText,
}: CheckboxFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={name}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          className={cn(error && "border-red-500")}
          aria-invalid={!!error}
        />
        <div className="grid gap-1.5 leading-none flex-1">
          <Label
            htmlFor={name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {label}
          </Label>
          {helperText && !error && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Switch Field
// ============================================================================

interface SwitchFieldProps {
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  helperText?: string;
}

export function SwitchField({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  className,
  helperText,
}: SwitchFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <Label htmlFor={name} className="text-sm font-medium">
            {label}
          </Label>
          {helperText && (
            <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
          )}
        </div>
        <Switch
          id={name}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Phone Number Field
// ============================================================================

interface PhoneFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  register: UseFormRegister<T>;
  placeholder?: string;
  countryCode?: string;
}

export function PhoneField<T extends FieldValues>({
  name,
  label,
  register,
  error,
  required = false,
  disabled = false,
  placeholder = "+1 (555) 000-0000",
  countryCode = "+1",
  className,
  helperText,
}: PhoneFieldProps<T>) {
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium border-r pr-2">
          {countryCode}
        </div>
        
        <Input
          id={name}
          type="tel"
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="tel"
          className={cn(
            "pl-14",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          aria-invalid={!!error}
          {...register(name, {
            onChange: (e) => {
              e.target.value = formatPhoneNumber(e.target.value);
            },
          })}
        />
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error.message}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Export All
// ============================================================================

export type {
  TextFieldProps,
  PasswordFieldProps,
  TextareaFieldProps,
  SelectFieldProps,
  CheckboxFieldProps,
  SwitchFieldProps,
  PhoneFieldProps,
  SelectOption,
};
