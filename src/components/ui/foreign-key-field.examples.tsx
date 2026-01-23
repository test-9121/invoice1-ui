/**
 * ForeignKeyField Component - Usage Examples
 * 
 * A reusable component for selecting foreign key relationships with search functionality
 */

import { useState } from "react";
import { 
  ForeignKeyField, 
  useForeignKeyField,
  type ForeignKeyOption 
} from "@/components/ui/foreign-key-field";

// ============================================================================
// Example 1: Basic Usage with Static Data
// ============================================================================

export function BasicExample() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const clientOptions: ForeignKeyOption[] = [
    { id: 1, label: "ABC Pvt Ltd", description: "Manufacturing Company" },
    { id: 2, label: "XYZ Corp", description: "IT Services" },
    { id: 3, label: "Demo Industries", description: "Retail" },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Client</label>
      <ForeignKeyField
        value={selectedClientId}
        onChange={(value) => setSelectedClientId(value as number | null)}
        options={clientOptions}
        placeholder="Select a client..."
        searchPlaceholder="Search clients..."
      />
    </div>
  );
}

// ============================================================================
// Example 2: With API Integration Using Hook
// ============================================================================

export function ApiIntegrationExample() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Using the custom hook for API integration
  const { options, loading, onSearch } = useForeignKeyField({
    fetchOptions: async (searchTerm) => {
      // Replace with your actual API call
      const response = await fetch(
        `/api/v1/clients?search=${searchTerm}&limit=50`
      );
      const data = await response.json();
      return data.data; // Assuming response has { success: true, data: [...] }
    },
    mapOption: (client: any) => ({
      id: client.id,
      label: client.name,
      description: client.email || client.phone,
    }),
    enableSearch: true, // Enable server-side search
  });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Client</label>
      <ForeignKeyField
        value={selectedClientId}
        onChange={(value) => setSelectedClientId(value as number | null)}
        options={options}
        loading={loading}
        onSearch={onSearch}
        placeholder="Select a client..."
        searchPlaceholder="Search clients..."
        allowClear
      />
    </div>
  );
}

// ============================================================================
// Example 3: Custom Rendering
// ============================================================================

export function CustomRenderExample() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const productOptions: ForeignKeyOption[] = [
    { 
      id: 1, 
      label: "Premium Widget", 
      description: "High quality product",
      price: 999.99,
      stock: 50
    },
    { 
      id: 2, 
      label: "Basic Widget", 
      description: "Standard product",
      price: 499.99,
      stock: 100
    },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Product</label>
      <ForeignKeyField
        value={selectedProductId}
        onChange={(value) => setSelectedProductId(value as number | null)}
        options={productOptions}
        placeholder="Select a product..."
        renderOption={(option) => (
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">₹{option.price}</div>
              <div className="text-xs text-muted-foreground">
                Stock: {option.stock}
              </div>
            </div>
          </div>
        )}
        renderSelected={(option) => (
          <span>
            {option.label} - ₹{option.price}
          </span>
        )}
      />
    </div>
  );
}

// ============================================================================
// Example 4: Form Integration with React Hook Form
// ============================================================================

import { useForm, Controller } from "react-hook-form";

interface InvoiceFormData {
  clientId: number | null;
  productId: number | null;
  amount: number;
}

export function FormIntegrationExample() {
  const { control, handleSubmit } = useForm<InvoiceFormData>({
    defaultValues: {
      clientId: null,
      productId: null,
      amount: 0,
    },
  });

  const { options: clientOptions, loading: clientsLoading } = useForeignKeyField({
    fetchOptions: async () => {
      const response = await fetch("/api/v1/clients");
      const data = await response.json();
      return data.data;
    },
    mapOption: (client: any) => ({
      id: client.id,
      label: client.name,
      description: client.email,
    }),
  });

  const onSubmit = (data: InvoiceFormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Client</label>
        <Controller
          name="clientId"
          control={control}
          rules={{ required: "Client is required" }}
          render={({ field, fieldState }) => (
            <div>
              <ForeignKeyField
                value={field.value}
                onChange={field.onChange}
                options={clientOptions}
                loading={clientsLoading}
                placeholder="Select a client..."
              />
              {fieldState.error && (
                <p className="text-sm text-destructive mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <button type="submit" className="btn-primary">
        Submit
      </button>
    </form>
  );
}

// ============================================================================
// Example 5: Multiple Foreign Keys in Same Form
// ============================================================================

export function MultipleFieldsExample() {
  const [formData, setFormData] = useState({
    clientId: null as number | null,
    productId: null as number | null,
    assignedToId: null as number | null,
  });

  const clients = useForeignKeyField({
    fetchOptions: async () => {
      const response = await fetch("/api/v1/clients");
      return (await response.json()).data;
    },
    mapOption: (item: any) => ({ id: item.id, label: item.name }),
  });

  const products = useForeignKeyField({
    fetchOptions: async () => {
      const response = await fetch("/api/v1/products");
      return (await response.json()).data;
    },
    mapOption: (item: any) => ({ 
      id: item.id, 
      label: item.name,
      description: `₹${item.price}`
    }),
  });

  const users = useForeignKeyField({
    fetchOptions: async () => {
      const response = await fetch("/api/v1/users");
      return (await response.json()).data;
    },
    mapOption: (item: any) => ({ 
      id: item.id, 
      label: item.fullName,
      description: item.role
    }),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Client</label>
        <ForeignKeyField
          value={formData.clientId}
          onChange={(value) => setFormData({ ...formData, clientId: value as number | null })}
          options={clients.options}
          loading={clients.loading}
          placeholder="Select client..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Product</label>
        <ForeignKeyField
          value={formData.productId}
          onChange={(value) => setFormData({ ...formData, productId: value as number | null })}
          options={products.options}
          loading={products.loading}
          placeholder="Select product..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Assign To</label>
        <ForeignKeyField
          value={formData.assignedToId}
          onChange={(value) => setFormData({ ...formData, assignedToId: value as number | null })}
          options={users.options}
          loading={users.loading}
          placeholder="Select user..."
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 6: With Disabled State
// ============================================================================

export function DisabledExample() {
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [isDisabled, setIsDisabled] = useState(true);

  const options: ForeignKeyOption[] = [
    { id: 1, label: "Option 1" },
    { id: 2, label: "Option 2" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isDisabled}
          onChange={(e) => setIsDisabled(e.target.checked)}
          id="disable-field"
        />
        <label htmlFor="disable-field">Disable field</label>
      </div>

      <ForeignKeyField
        value={selectedId}
        onChange={(value) => setSelectedId(value as number | null)}
        options={options}
        disabled={isDisabled}
        placeholder="Select option..."
      />
    </div>
  );
}
