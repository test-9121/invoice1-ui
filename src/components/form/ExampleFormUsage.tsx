// Example Usage of Reusable Form Fields
// This demonstrates best practices for using the form field components

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  TextField,
  PasswordField,
  TextareaField,
  SelectField,
  CheckboxField,
  SwitchField,
  PhoneField,
} from "@/components/form/FormFields";
import { Mail, User } from "lucide-react";

interface ExampleFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  bio: string;
  role: string;
  newsletter: boolean;
  status: boolean;
}

export function ExampleFormUsage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExampleFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      bio: "",
      role: "",
      newsletter: false,
      status: true,
    },
  });

  const password = watch("password");
  const role = watch("role");
  const newsletter = watch("newsletter");
  const status = watch("status");

  const onSubmit = async (data: ExampleFormData) => {
    console.log("Form submitted:", data);
    // Handle form submission
  };

  const roleOptions = [
    { value: "admin", label: "Administrator" },
    { value: "user", label: "User" },
    { value: "guest", label: "Guest" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Example Form</h2>

      {/* Text Fields with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          name="firstName"
          label="First Name"
          register={register}
          error={errors.firstName}
          required
          placeholder="John"
          icon={<User className="w-4 h-4" />}
          helperText="Enter your first name"
          showSuccessState
        />

        <TextField
          name="lastName"
          label="Last Name"
          register={register}
          error={errors.lastName}
          required
          placeholder="Doe"
          helperText="Enter your last name"
        />
      </div>

      {/* Email Field */}
      <TextField
        name="email"
        label="Email Address"
        type="email"
        register={register}
        error={errors.email}
        required
        placeholder="john.doe@example.com"
        autoComplete="email"
        icon={<Mail className="w-4 h-4" />}
        helperText="We'll never share your email"
      />

      {/* Phone Field */}
      <PhoneField
        name="phone"
        label="Phone Number"
        register={register}
        error={errors.phone}
        placeholder="(555) 000-0000"
        countryCode="+1"
        helperText="10-digit phone number"
      />

      {/* Password Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PasswordField
          name="password"
          label="Password"
          register={register}
          error={errors.password}
          required
          placeholder="Enter password"
          autoComplete="new-password"
          showStrengthIndicator
          helperText="Minimum 8 characters"
        />

        <PasswordField
          name="confirmPassword"
          label="Confirm Password"
          register={register}
          error={errors.confirmPassword}
          required
          placeholder="Confirm password"
          autoComplete="new-password"
          helperText="Must match password"
        />
      </div>

      {/* Textarea Field */}
      <TextareaField
        name="bio"
        label="Biography"
        register={register}
        error={errors.bio}
        placeholder="Tell us about yourself..."
        rows={5}
        maxLength={500}
        showCharCount
        helperText="Brief description about yourself"
      />

      {/* Select Field */}
      <SelectField
        name="role"
        label="User Role"
        options={roleOptions}
        value={role}
        onChange={(value) => setValue("role", value)}
        error={errors.role}
        required
        placeholder="Select a role"
        helperText="Choose your access level"
      />

      {/* Checkbox Field */}
      <CheckboxField
        name="newsletter"
        label="Subscribe to newsletter"
        checked={newsletter}
        onChange={(checked) => setValue("newsletter", checked)}
        helperText="Receive updates about new features and promotions"
      />

      {/* Switch Field */}
      <SwitchField
        name="status"
        label="Account Status"
        checked={status}
        onChange={(checked) => setValue("status", checked)}
        helperText="Enable or disable your account"
      />

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// Validation Examples
// ============================================================================

export const validationExamples = {
  // Required field
  firstName: {
    required: "First name is required",
    minLength: { value: 2, message: "Minimum 2 characters" },
    maxLength: { value: 50, message: "Maximum 50 characters" },
  },

  // Email validation
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },

  // Password validation
  password: {
    required: "Password is required",
    minLength: { value: 8, message: "Minimum 8 characters" },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: "Must contain uppercase, lowercase, number and special character",
    },
  },

  // Confirm password validation
  confirmPassword: {
    required: "Please confirm password",
    validate: (value: string, formValues: any) =>
      value === formValues.password || "Passwords do not match",
  },

  // Phone validation
  phone: {
    required: "Phone number is required",
    pattern: {
      value: /^\(\d{3}\) \d{3}-\d{4}$/,
      message: "Invalid phone number format",
    },
  },

  // URL validation
  website: {
    pattern: {
      value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      message: "Invalid URL format",
    },
  },

  // Number validation
  age: {
    required: "Age is required",
    min: { value: 18, message: "Must be at least 18" },
    max: { value: 100, message: "Must be less than 100" },
  },
};
