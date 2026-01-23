import * as React from "react";
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ForeignKeyOption {
  id: number | string;
  label: string;
  description?: string;
  [key: string]: any;
}

export interface ForeignKeyFieldProps {
  value?: number | string | null | (number | string)[];
  onChange: (value: number | string | null | (number | string)[]) => void;
  options?: ForeignKeyOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  onSearch?: (searchTerm: string) => void;
  allowClear?: boolean;
  multiple?: boolean;
  className?: string;
  renderOption?: (option: ForeignKeyOption) => React.ReactNode;
  renderSelected?: (option: ForeignKeyOption) => React.ReactNode;
  maxDisplayCount?: number;
}

export function ForeignKeyField({
  value,
  onChange,
  options = [],
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  loading = false,
  onSearch,
  allowClear = true,
  multiple = false,
  className,
  renderOption,
  renderSelected,
  maxDisplayCount = 2,
}: ForeignKeyFieldProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [buttonWidth, setButtonWidth] = useState<number>(0);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Normalize value to array for easier handling
  const selectedValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return value ? [value] : [];
  }, [value, multiple]);

  // Find selected options
  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => selectedValues.includes(option.id));
  }, [options, selectedValues]);

  // Measure button width when component mounts or opens
  React.useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [open]);

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;
    
    const lowerSearch = searchTerm.toLowerCase();
    return options.filter((option) => {
      const labelMatch = option.label.toLowerCase().includes(lowerSearch);
      const descriptionMatch = option.description?.toLowerCase().includes(lowerSearch);
      return labelMatch || descriptionMatch;
    });
  }, [options, searchTerm]);

  // Handle search with debounce for API calls
  useEffect(() => {
    if (!onSearch) return;

    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleSelect = (selectedId: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : value ? [value] : [];
      const isSelected = currentValues.includes(selectedId as any);
      
      let newValues: (number | string)[];
      if (isSelected) {
        // Remove from selection
        newValues = currentValues.filter(v => String(v) !== selectedId);
      } else {
        // Add to selection
        newValues = [...currentValues, selectedId];
      }
      
      // Convert to numbers if original value was number
      if (currentValues.length > 0 && typeof currentValues[0] === 'number') {
        onChange(newValues.map(v => Number(v)) as any);
      } else {
        onChange(newValues as any);
      }
    } else {
      // Single select mode
      const newValue = selectedId === String(value) ? null : selectedId;
      
      // Convert to number if the original value was a number
      if (newValue !== null && typeof value === 'number') {
        onChange(Number(newValue));
      } else {
        onChange(newValue);
      }
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : null);
  };

  const isSelected = (optionId: number | string) => {
    return selectedValues.includes(optionId);
  };

  const defaultRenderOption = (option: ForeignKeyOption) => (
    <div className="flex flex-col overflow-hidden">
      <span className="font-medium truncate">{option.label}</span>
      {option.description && (
        <span className="text-xs text-muted-foreground truncate">{option.description}</span>
      )}
    </div>
  );

  const defaultRenderSelected = (option: ForeignKeyOption) => (
    <span className="truncate block">{option.label}</span>
  );

  const renderButtonContent = () => {
    if (multiple && selectedOptions.length > 0) {
      const displayCount = maxDisplayCount || 2;
      const displayedOptions = selectedOptions.slice(0, displayCount);
      const remainingCount = selectedOptions.length - displayCount;

      return (
        <div className="flex flex-wrap gap-1 flex-1 overflow-hidden">
          {displayedOptions.map((opt) => (
            <Badge key={opt.id} variant="secondary" className="truncate max-w-[120px]">
              {opt.label}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="secondary">+{remainingCount}</Badge>
          )}
        </div>
      );
    }

    // Single select mode
    if (selectedOptions.length > 0) {
      const option = selectedOptions[0];
      return renderSelected
        ? renderSelected(option)
        : defaultRenderSelected(option);
    }

    return <span className="text-muted-foreground">{placeholder}</span>;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate flex-1 text-left">
            {renderButtonContent()}
          </span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {allowClear && (multiple ? selectedOptions.length > 0 : value) && !disabled && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0" 
        align="start"
        style={{ width: buttonWidth || undefined }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
            disabled={loading}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredOptions.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={String(option.id)}
                    onSelect={handleSelect}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        isSelected(option.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 overflow-hidden">
                      {renderOption ? renderOption(option) : defaultRenderOption(option)}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Hook for managing foreign key field with API integration
export interface UseForeignKeyFieldOptions<T = any> {
  fetchOptions: (searchTerm?: string) => Promise<T[]>;
  mapOption: (item: T) => ForeignKeyOption;
  initialOptions?: T[];
  enableSearch?: boolean;
}

export function useForeignKeyField<T = any>({
  fetchOptions,
  mapOption,
  initialOptions = [],
  enableSearch = true,
}: UseForeignKeyFieldOptions<T>) {
  const [options, setOptions] = useState<ForeignKeyOption[]>(
    initialOptions.map(mapOption)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = async (searchTerm: string = "") => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOptions(searchTerm);
      setOptions(data.map(mapOption));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load options");
      console.error("Error loading options:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const handleSearch = enableSearch ? loadOptions : undefined;

  return {
    options,
    loading,
    error,
    onSearch: handleSearch,
    refresh: () => loadOptions(),
  };
}
