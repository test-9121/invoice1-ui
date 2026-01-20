# Reusable Form Fields Documentation

## Overview

A collection of reusable, accessible, and type-safe form field components built with React Hook Form, TypeScript, and shadcn/ui components.

## Features

✅ **Type-Safe**: Full TypeScript support with generic types
✅ **Accessible**: ARIA labels, error states, and keyboard navigation
✅ **Validation**: Built-in validation with error messages
✅ **Visual Feedback**: Success/error states with icons
✅ **Customizable**: Extensive props for customization
✅ **Consistent**: Unified styling across all fields
✅ **Best Practices**: Following React Hook Form patterns

## Available Components

### 1. TextField
Standard text input with various types (text, email, tel, url, number)

**Props:**
- `name`: Field name (required)
- `label`: Field label (required)
- `register`: React Hook Form register (required)
- `error`: Field error from formState
- `type`: Input type (default: "text")
- `required`: Show required indicator
- `placeholder`: Placeholder text
- `icon`: Left icon element
- `helperText`: Helper text below field
- `showSuccessState`: Show green checkmark when valid

**Example:**
```tsx
<TextField
  name="email"
  label="Email Address"
  type="email"
  register={register}
  error={errors.email}
  required
  placeholder="john@example.com"
  icon={<Mail className="w-4 h-4" />}
  helperText="We'll never share your email"
  showSuccessState
/>
```

### 2. PasswordField
Password input with show/hide toggle and optional strength indicator

**Props:**
- `name`: Field name (required)
- `label`: Field label (required)
- `register`: React Hook Form register (required)
- `error`: Field error
- `showStrengthIndicator`: Show password strength meter
- `autoComplete`: Autocomplete attribute

**Example:**
```tsx
<PasswordField
  name="password"
  label="Password"
  register={register}
  error={errors.password}
  required
  showStrengthIndicator
  helperText="Minimum 8 characters"
/>
```

### 3. TextareaField
Multi-line text input with character counter

**Props:**
- `rows`: Number of rows (default: 4)
- `maxLength`: Maximum character length
- `showCharCount`: Display character counter

**Example:**
```tsx
<TextareaField
  name="bio"
  label="Biography"
  register={register}
  error={errors.bio}
  rows={5}
  maxLength={500}
  showCharCount
  helperText="Tell us about yourself"
/>
```

### 4. SelectField
Dropdown select with custom options

**Props:**
- `options`: Array of {value, label, disabled?}
- `value`: Current value (required)
- `onChange`: Change handler (required)
- `placeholder`: Placeholder text

**Example:**
```tsx
<SelectField
  name="role"
  label="User Role"
  options={[
    { value: "admin", label: "Administrator" },
    { value: "user", label: "User" }
  ]}
  value={watch("role")}
  onChange={(value) => setValue("role", value)}
  error={errors.role}
  required
/>
```

### 5. CheckboxField
Single checkbox with label and helper text

**Props:**
- `checked`: Checked state (required)
- `onChange`: Change handler (required)

**Example:**
```tsx
<CheckboxField
  name="terms"
  label="I agree to the terms and conditions"
  checked={watch("terms")}
  onChange={(checked) => setValue("terms", checked)}
  error={errors.terms}
  helperText="You must accept to continue"
/>
```

### 6. SwitchField
Toggle switch for boolean values

**Example:**
```tsx
<SwitchField
  name="notifications"
  label="Enable Notifications"
  checked={watch("notifications")}
  onChange={(checked) => setValue("notifications", checked)}
  helperText="Receive email notifications"
/>
```

### 7. PhoneField
Phone number input with formatting and country code

**Props:**
- `countryCode`: Country code prefix (default: "+1")

**Example:**
```tsx
<PhoneField
  name="phone"
  label="Phone Number"
  register={register}
  error={errors.phone}
  countryCode="+1"
  placeholder="(555) 000-0000"
/>
```

## Common Validation Patterns

### Required Field
```tsx
register("fieldName", {
  required: "This field is required"
})
```

### Email Validation
```tsx
register("email", {
  required: "Email is required",
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: "Invalid email address"
  }
})
```

### Password Validation
```tsx
register("password", {
  required: "Password is required",
  minLength: { value: 8, message: "Minimum 8 characters" },
  pattern: {
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    message: "Must contain uppercase, lowercase, number and special character"
  }
})
```

### Confirm Password
```tsx
register("confirmPassword", {
  required: "Please confirm password",
  validate: (value) => value === watch("password") || "Passwords do not match"
})
```

### Phone Validation
```tsx
register("phone", {
  pattern: {
    value: /^\(\d{3}\) \d{3}-\d{4}$/,
    message: "Invalid phone number format"
  }
})
```

## Accessibility Features

- ✅ Proper ARIA labels and descriptions
- ✅ Error announcements for screen readers
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Required field indicators
- ✅ Accessible color contrast

## Styling

All components use Tailwind CSS and shadcn/ui design system:
- Consistent spacing and sizing
- Error states (red borders/text)
- Success states (green borders/icons)
- Disabled states (reduced opacity)
- Focus rings for accessibility

## Best Practices

1. **Always use with React Hook Form**
2. **Pass field errors from formState.errors**
3. **Use meaningful labels and helper text**
4. **Mark required fields visually**
5. **Provide clear validation messages**
6. **Use appropriate input types**
7. **Test keyboard navigation**
8. **Ensure color contrast**

## Complete Form Example

```tsx
import { useForm } from "react-hook-form";
import { TextField, PasswordField, SelectField } from "@/components/form/FormFields";

function MyForm() {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        name="name"
        label="Full Name"
        register={register}
        error={errors.name}
        required
      />

      <PasswordField
        name="password"
        label="Password"
        register={register}
        error={errors.password}
        required
        showStrengthIndicator
      />

      <SelectField
        name="role"
        label="Role"
        options={[{value: "admin", label: "Admin"}]}
        value={watch("role")}
        onChange={(v) => setValue("role", v)}
        error={errors.role}
      />

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Migration Guide

### From old Input to TextField
```tsx
// Before
<Input {...register("name")} />

// After
<TextField
  name="name"
  label="Name"
  register={register}
  error={errors.name}
/>
```

This provides better accessibility, validation, and user experience!
