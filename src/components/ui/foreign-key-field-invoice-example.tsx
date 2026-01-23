/**
 * Real-world example: Using ForeignKeyField in Invoice Creation Form
 * This demonstrates how to integrate the component with your existing API structure
 */

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ForeignKeyField, useForeignKeyField } from "@/components/ui/foreign-key-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";

interface InvoiceFormData {
  clientId: number | null;
  productIds: number[];
  assignedToId: number | null;
  amount: number;
  dueDate: string;
}

export function InvoiceCreationForm() {
  const { toast } = useToast();
  const { control, handleSubmit, watch, setValue } = useForm<InvoiceFormData>({
    defaultValues: {
      clientId: null,
      productIds: [],
      assignedToId: null,
      amount: 0,
      dueDate: "",
    },
  });

  // Client foreign key field with search
  const clientsField = useForeignKeyField({
    fetchOptions: async (searchTerm = "") => {
      try {
        const response: any = await apiClient.get(
          `/api/v1/clients?search=${searchTerm}&limit=50`,
          true
        );
        return response.data || [];
      } catch (error) {
        console.error("Error fetching clients:", error);
        return [];
      }
    },
    mapOption: (client: any) => ({
      id: client.id,
      label: client.name,
      description: client.email || client.phone || client.address,
    }),
    enableSearch: true, // Enable server-side search
  });

  // Products foreign key field
  const productsField = useForeignKeyField({
    fetchOptions: async (searchTerm = "") => {
      try {
        const response: any = await apiClient.get(
          `/api/v1/products?search=${searchTerm}&limit=100`,
          true
        );
        return response.data || [];
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
    mapOption: (product: any) => ({
      id: product.id,
      label: product.name,
      description: product.description,
      price: product.price,
      sku: product.sku,
    }),
    enableSearch: true,
  });

  // Users foreign key field (for assignment)
  const usersField = useForeignKeyField({
    fetchOptions: async (searchTerm = "") => {
      try {
        const response: any = await apiClient.get(
          `/api/v1/users?search=${searchTerm}&role=sales`,
          true
        );
        return response.data || [];
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    },
    mapOption: (user: any) => ({
      id: user.id,
      label: user.fullName || `${user.firstName} ${user.lastName}`,
      description: user.email,
      role: user.role,
    }),
    enableSearch: true,
  });

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const response: any = await apiClient.post("/api/v1/invoices", data, true);
      if (response.success) {
        toast({
          title: "Success",
          description: "Invoice created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Create New Invoice</h2>

      {/* Client Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Client <span className="text-destructive">*</span>
        </label>
        <Controller
          name="clientId"
          control={control}
          rules={{ required: "Client is required" }}
          render={({ field, fieldState }) => (
            <div>
              <ForeignKeyField
                value={field.value}
                onChange={field.onChange}
                options={clientsField.options}
                loading={clientsField.loading}
                onSearch={clientsField.onSearch}
                placeholder="Search and select a client..."
                searchPlaceholder="Type to search clients..."
                allowClear
                renderOption={(option) => (
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </div>
                )}
              />
              {fieldState.error && (
                <p className="text-sm text-destructive mt-1">
                  {fieldState.error.message}
                </p>
              )}
              {clientsField.error && (
                <p className="text-sm text-amber-600 mt-1">
                  Warning: {clientsField.error}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* Product Selection with Custom Rendering */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Product/Service <span className="text-destructive">*</span>
        </label>
        <Controller
          name="productIds"
          control={control}
          render={({ field }) => (
            <ForeignKeyField
              value={field.value[0] || null}
              onChange={(value) => field.onChange(value ? [value] : [])}
              options={productsField.options}
              loading={productsField.loading}
              onSearch={productsField.onSearch}
              placeholder="Search products or services..."
              searchPlaceholder="Type to search..."
              renderOption={(option) => (
                <div className="flex justify-between items-start w-full">
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    {option.sku && (
                      <span className="text-xs text-muted-foreground">
                        SKU: {option.sku}
                      </span>
                    )}
                  </div>
                  {option.price && (
                    <span className="text-sm font-semibold">
                      ₹{Number(option.price).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
              renderSelected={(option) => (
                <span>
                  {option.label}
                  {option.price && ` - ₹${Number(option.price).toLocaleString()}`}
                </span>
              )}
            />
          )}
        />
      </div>

      {/* Assign To User */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Assign To</label>
        <Controller
          name="assignedToId"
          control={control}
          render={({ field }) => (
            <ForeignKeyField
              value={field.value}
              onChange={field.onChange}
              options={usersField.options}
              loading={usersField.loading}
              onSearch={usersField.onSearch}
              placeholder="Select a user to assign..."
              searchPlaceholder="Search users..."
              allowClear
              renderOption={(option) => (
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                  {option.role && (
                    <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">
                      {option.role}
                    </span>
                  )}
                </div>
              )}
            />
          )}
        />
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Amount <span className="text-destructive">*</span>
        </label>
        <Controller
          name="amount"
          control={control}
          rules={{ required: "Amount is required", min: 1 }}
          render={({ field, fieldState }) => (
            <div>
              <Input
                type="number"
                placeholder="Enter amount"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
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

      {/* Due Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Due Date</label>
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <Input type="date" {...field} />
          )}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button type="submit" variant="accent">
          Create Invoice
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// =============================================================================
// Example 2: Client Selection for Work Orders
// =============================================================================

export function WorkOrderClientSelector() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const { options, loading, onSearch, error } = useForeignKeyField({
    fetchOptions: async (searchTerm = "") => {
      const response: any = await apiClient.get(
        `/api/v1/clients?search=${searchTerm}&status=active`,
        true
      );
      return response.data || [];
    },
    mapOption: (client: any) => ({
      id: client.id,
      label: client.name,
      description: `${client.email} • ${client.phone}`,
      totalInvoices: client.totalInvoices || 0,
      status: client.status,
    }),
    enableSearch: true,
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
        placeholder="Search for a client..."
        searchPlaceholder="Type client name, email, or phone..."
        allowClear
        renderOption={(option) => (
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">
                {option.totalInvoices} invoices
              </span>
              {option.status === "active" && (
                <span className="text-xs text-green-600">Active</span>
              )}
            </div>
          </div>
        )}
      />
      {error && (
        <p className="text-sm text-amber-600">Unable to load clients: {error}</p>
      )}
    </div>
  );
}
