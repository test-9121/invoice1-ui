/**
 * Multi-Select ForeignKeyField Examples
 * 
 * This file demonstrates how to use the ForeignKeyField component in multi-select mode.
 */

import { useState } from "react";
import { ForeignKeyField, type ForeignKeyOption, useForeignKeyField } from "./foreign-key-field";
import { Controller, useForm } from "react-hook-form";

// Example 1: Basic Multi-Select
export function BasicMultiSelectExample() {
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const roleOptions: ForeignKeyOption[] = [
    { id: 1, label: "Administrator", description: "Full system access" },
    { id: 2, label: "Manager", description: "Team management capabilities" },
    { id: 3, label: "Developer", description: "Development access" },
    { id: 4, label: "Designer", description: "Design tools access" },
    { id: 5, label: "Analyst", description: "Data analysis access" },
    { id: 6, label: "Support", description: "Customer support access" },
    { id: 7, label: "Guest", description: "View-only access" },
  ];

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Select User Roles
        </label>
        <ForeignKeyField
          value={selectedRoleIds}
          onChange={(value) => setSelectedRoleIds(value as number[])}
          options={roleOptions}
          multiple
          maxDisplayCount={3}
          placeholder="Select roles..."
          searchPlaceholder="Search roles..."
        />
      </div>
      <div className="text-sm text-gray-600">
        Selected: {selectedRoleIds.length === 0 
          ? "None" 
          : selectedRoleIds.map(id => 
              roleOptions.find(r => r.id === id)?.label
            ).join(", ")
        }
      </div>
    </div>
  );
}

// Example 2: Multi-Select with API Integration
export function MultiSelectWithAPIExample() {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const { options, loading, onSearch } = useForeignKeyField({
    fetchOptions: async (searchTerm) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const allTags = [
        { id: 1, name: "Important", color: "red" },
        { id: 2, name: "Urgent", color: "orange" },
        { id: 3, name: "Follow-up", color: "blue" },
        { id: 4, name: "Review", color: "purple" },
        { id: 5, name: "Approved", color: "green" },
        { id: 6, name: "Pending", color: "yellow" },
      ];

      return searchTerm
        ? allTags.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : allTags;
    },
    mapOption: (tag) => ({
      id: tag.id,
      label: tag.name,
      description: `Tag color: ${tag.color}`,
      color: tag.color,
    }),
    enableSearch: true,
  });

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Select Tags
        </label>
        <ForeignKeyField
          value={selectedTagIds}
          onChange={(value) => setSelectedTagIds(value as number[])}
          options={options}
          loading={loading}
          onSearch={onSearch}
          multiple
          maxDisplayCount={4}
          placeholder="Select tags..."
          searchPlaceholder="Search tags..."
          renderOption={(option) => (
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: option.color as string }}
              />
              <div className="flex-1 overflow-hidden">
                <div className="font-medium truncate">{option.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {option.description}
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}

// Example 3: Multi-Select with React Hook Form
interface MultiSelectFormData {
  categoryIds: number[];
  departmentIds: number[];
}

export function MultiSelectFormExample() {
  const { control, handleSubmit, watch } = useForm<MultiSelectFormData>({
    defaultValues: {
      categoryIds: [],
      departmentIds: [],
    },
  });

  const categoryOptions: ForeignKeyOption[] = [
    { id: 1, label: "Electronics", description: "Electronic devices" },
    { id: 2, label: "Furniture", description: "Office furniture" },
    { id: 3, label: "Supplies", description: "Office supplies" },
    { id: 4, label: "Software", description: "Software licenses" },
  ];

  const departmentOptions: ForeignKeyOption[] = [
    { id: 1, label: "IT", description: "Information Technology" },
    { id: 2, label: "HR", description: "Human Resources" },
    { id: 3, label: "Sales", description: "Sales Department" },
    { id: 4, label: "Marketing", description: "Marketing Team" },
  ];

  const onSubmit = (data: MultiSelectFormData) => {
    console.log("Form submitted:", data);
    alert(`Categories: ${data.categoryIds.join(", ")}\nDepartments: ${data.departmentIds.join(", ")}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Product Categories *
        </label>
        <Controller
          name="categoryIds"
          control={control}
          rules={{ required: "Please select at least one category" }}
          render={({ field, fieldState }) => (
            <>
              <ForeignKeyField
                value={field.value}
                onChange={field.onChange}
                options={categoryOptions}
                multiple
                maxDisplayCount={2}
                placeholder="Select categories..."
                searchPlaceholder="Search categories..."
              />
              {fieldState.error && (
                <p className="text-sm text-red-500 mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Departments
        </label>
        <Controller
          name="departmentIds"
          control={control}
          render={({ field }) => (
            <ForeignKeyField
              value={field.value}
              onChange={field.onChange}
              options={departmentOptions}
              multiple
              maxDisplayCount={3}
              placeholder="Select departments..."
              searchPlaceholder="Search departments..."
            />
          )}
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Submit
      </button>

      <div className="text-sm text-gray-600">
        <div>Selected Categories: {watch("categoryIds").length}</div>
        <div>Selected Departments: {watch("departmentIds").length}</div>
      </div>
    </form>
  );
}

// Example 4: Limited Multi-Select with maxDisplayCount variations
export function MaxDisplayCountExample() {
  const [products1, setProducts1] = useState<number[]>([1, 2, 3, 4, 5]);
  const [products2, setProducts2] = useState<number[]>([1, 2, 3, 4, 5]);
  const [products3, setProducts3] = useState<number[]>([1, 2, 3, 4, 5]);

  const productOptions: ForeignKeyOption[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    label: `Product ${i + 1}`,
    description: `Description for product ${i + 1}`,
  }));

  return (
    <div className="space-y-6 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Max Display: 1 (shows +4 more)
        </label>
        <ForeignKeyField
          value={products1}
          onChange={(value) => setProducts1(value as number[])}
          options={productOptions}
          multiple
          maxDisplayCount={1}
          placeholder="Select products..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Max Display: 3 (default - shows +2 more)
        </label>
        <ForeignKeyField
          value={products2}
          onChange={(value) => setProducts2(value as number[])}
          options={productOptions}
          multiple
          maxDisplayCount={3}
          placeholder="Select products..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Max Display: 5 (shows all)
        </label>
        <ForeignKeyField
          value={products3}
          onChange={(value) => setProducts3(value as number[])}
          options={productOptions}
          multiple
          maxDisplayCount={5}
          placeholder="Select products..."
        />
      </div>
    </div>
  );
}
