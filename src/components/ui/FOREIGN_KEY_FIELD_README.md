# ForeignKeyField Component

A reusable React component for handling foreign key relationships with search functionality. Perfect for forms with dropdown selections that need to reference related data (clients, products, users, etc.).

## Features

✅ **Search functionality** - Filter options with real-time search  
✅ **API integration** - Built-in support for server-side data fetching  
✅ **Debounced search** - Automatic debouncing for API calls  
✅ **Custom rendering** - Customize how options and selections are displayed  
✅ **Loading states** - Built-in loading indicator  
✅ **Clear button** - Optional clear functionality  
✅ **Multi-select mode** - Select multiple options with badge display  
✅ **Keyboard navigation** - Full keyboard support  
✅ **Accessibility** - ARIA compliant  
✅ **TypeScript** - Full type safety  
✅ **Form integration** - Works with React Hook Form and other form libraries  
✅ **Text truncation** - Automatic ellipsis for long text with `truncate` class  
✅ **Consistent width** - Dropdown panel matches button width exactly  

## Installation

The component is already in your project at:
```
src/components/ui/foreign-key-field.tsx
```

## Basic Usage

```tsx
import { useState } from "react";
import { ForeignKeyField, type ForeignKeyOption } from "@/components/ui/foreign-key-field";

function MyComponent() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const clientOptions: ForeignKeyOption[] = [
    { id: 1, label: "ABC Pvt Ltd", description: "Manufacturing Company" },
    { id: 2, label: "XYZ Corp", description: "IT Services" },
  ];

  return (
    <ForeignKeyField
      value={selectedClientId}
      onChange={(value) => setSelectedClientId(value as number | null)}
      options={clientOptions}
      placeholder="Select a client..."
      searchPlaceholder="Search clients..."
    />
  );
}
```

## API Integration

Use the `useForeignKeyField` hook for seamless API integration:

```tsx
import { useState } from "react";
import { ForeignKeyField, useForeignKeyField } from "@/components/ui/foreign-key-field";

function ClientSelector() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const { options, loading, onSearch } = useForeignKeyField({
    fetchOptions: async (searchTerm) => {
      const response = await fetch(`/api/v1/clients?search=${searchTerm}`);
      const data = await response.json();
      return data.data;
    },
    mapOption: (client) => ({
      id: client.id,
      label: client.name,
      description: client.email,
    }),
    enableSearch: true, // Enable server-side search
  });

  return (
    <ForeignKeyField
      value={selectedClientId}
      onChange={(value) => setSelectedClientId(value as number | null)}
      options={options}
      loading={loading}
      onSearch={onSearch}
      placeholder="Select a client..."
      allowClear
    />
  );
}
```

## Props

### ForeignKeyField Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| string \| null \| (number \| string)[]` | - | Selected value(s) (ID or array of IDs) |
| `onChange` | `(value: number \| string \| null \| (number \| string)[]) => void` | - | Callback when selection changes |
| `options` | `ForeignKeyOption[]` | `[]` | Array of options to display |
| `placeholder` | `string` | `"Select an option..."` | Placeholder text |
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder |
| `emptyMessage` | `string` | `"No results found."` | Message when no options match |
| `disabled` | `boolean` | `false` | Disable the field |
| `loading` | `boolean` | `false` | Show loading indicator |
| `onSearch` | `(searchTerm: string) => void` | - | Callback for search (debounced) |
| `allowClear` | `boolean` | `true` | Show clear button |
| `multiple` | `boolean` | `false` | Enable multi-select mode |
| `maxDisplayCount` | `number` | `2` | Max badges to show in multi-select (remaining shown as +N) |
| `className` | `string` | - | Additional CSS classes |
| `renderOption` | `(option: ForeignKeyOption) => ReactNode` | - | Custom option renderer |
| `renderSelected` | `(option: ForeignKeyOption) => ReactNode` | - | Custom selected value renderer |

### ForeignKeyOption Type

```typescript
interface ForeignKeyOption {
  id: number | string;
  label: string;
  description?: string;
  [key: string]: any; // Additional custom properties
}
```

### useForeignKeyField Hook

```typescript
const { options, loading, error, onSearch, refresh } = useForeignKeyField({
  fetchOptions: async (searchTerm?: string) => Promise<T[]>,
  mapOption: (item: T) => ForeignKeyOption,
  initialOptions?: T[],
  enableSearch?: boolean,
});
```

**Returns:**
- `options` - Array of ForeignKeyOption
- `loading` - Boolean loading state
- `error` - Error message if fetch fails
- `onSearch` - Function to pass to ForeignKeyField
- `refresh` - Function to manually refresh options

## Advanced Examples

### Multi-Select Mode

```tsx
import { useState } from "react";
import { ForeignKeyField, type ForeignKeyOption } from "@/components/ui/foreign-key-field";

function MultiSelectExample() {
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const roleOptions: ForeignKeyOption[] = [
    { id: 1, label: "Admin", description: "Full system access" },
    { id: 2, label: "Manager", description: "Team management" },
    { id: 3, label: "User", description: "Basic access" },
    { id: 4, label: "Guest", description: "View only" },
  ];

  return (
    <ForeignKeyField
      value={selectedRoles}
      onChange={(value) => setSelectedRoles(value as number[])}
      options={roleOptions}
      multiple
      maxDisplayCount={3}
      placeholder="Select roles..."
      searchPlaceholder="Search roles..."
    />
  );
}
```

**Multi-select features:**
- Click to toggle selection (no auto-close)
- Selected items shown as badges in the button
- `maxDisplayCount` limits visible badges (e.g., shows "Admin, Manager, +2 more")
- Clear button removes all selections
- Checkmarks indicate selected items

### Custom Rendering

```tsx
<ForeignKeyField
  value={productId}
  onChange={(value) => setProductId(value as number | null)}
  options={productOptions}
  renderOption={(option) => (
    <div className="flex justify-between w-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <div className="font-medium truncate">{option.label}</div>
        <div className="text-xs text-muted-foreground truncate">{option.description}</div>
      </div>
      <div className="text-sm font-semibold shrink-0">₹{option.price}</div>
    </div>
  )}
  renderSelected={(option) => (
    <span className="truncate">{option.label} - ₹{option.price}</span>
  )}
/>
```

**Important**: Always use `overflow-hidden` and `truncate` classes to handle long text properly:
- Wrap content in containers with `overflow-hidden`
- Apply `truncate` to text elements that might overflow
- Use `shrink-0` on icons/badges that should not shrink

### React Hook Form Integration

```tsx
import { useForm, Controller } from "react-hook-form";
import { ForeignKeyField, useForeignKeyField } from "@/components/ui/foreign-key-field";

interface FormData {
  clientId: number | null;
}

function MyForm() {
  const { control, handleSubmit } = useForm<FormData>();

  const { options, loading } = useForeignKeyField({
    fetchOptions: async () => {
      const response = await fetch("/api/v1/clients");
      return (await response.json()).data;
    },
    mapOption: (client) => ({
      id: client.id,
      label: client.name,
    }),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="clientId"
        control={control}
        rules={{ required: "Client is required" }}
        render={({ field, fieldState }) => (
          <div>
            <ForeignKeyField
              value={field.value}
              onChange={field.onChange}
              options={options}
              loading={loading}
            />
            {fieldState.error && (
              <p className="text-destructive">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />
    </form>
  );
}
```

### Multiple Foreign Keys

```tsx
function InvoiceForm() {
  const [formData, setFormData] = useState({
    clientId: null,
    productId: null,
  });

  const clients = useForeignKeyField({
    fetchOptions: async () => fetch("/api/v1/clients").then(r => r.json()).then(d => d.data),
    mapOption: (item) => ({ id: item.id, label: item.name }),
  });

  const products = useForeignKeyField({
    fetchOptions: async () => fetch("/api/v1/products").then(r => r.json()).then(d => d.data),
    mapOption: (item) => ({ id: item.id, label: item.name, description: `₹${item.price}` }),
  });

  return (
    <div className="space-y-4">
      <ForeignKeyField
        value={formData.clientId}
        onChange={(value) => setFormData({ ...formData, clientId: value as number | null })}
        options={clients.options}
        loading={clients.loading}
        placeholder="Select client..."
      />
      
      <ForeignKeyField
        value={formData.productId}
        onChange={(value) => setFormData({ ...formData, productId: value as number | null })}
        options={products.options}
        loading={products.loading}
        placeholder="Select product..."
      />
    </div>
  );
}
```

## Use Cases

Perfect for:
- **Invoice forms** - Select clients, products, services
- **Work orders** - Select clients, assigned users
- **User management** - Select roles, departments
- **Inventory** - Select categories, suppliers
- **Any form** with foreign key relationships

## Styling

The component uses Tailwind CSS and shadcn/ui components. It respects your theme configuration and supports:
- Dark/light mode
- Custom color schemes
- Custom border radius
- Custom fonts

## Performance

- **Debounced search** - API calls are debounced by 300ms
- **Client-side filtering** - Fast filtering for static data
- **Lazy loading** - Options loaded on mount or on-demand
- **Memoized filtering** - Efficient re-renders

## Browser Support

Works on all modern browsers that support:
- ES6+
- React 18+
- CSS Grid/Flexbox

## Examples

See comprehensive examples in:
```
src/components/ui/foreign-key-field.examples.tsx
```

## License

Part of your project's codebase.
