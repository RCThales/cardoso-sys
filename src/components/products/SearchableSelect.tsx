
import { useState, useEffect } from "react";
import Select from "react-select";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  items: Array<{ id: string; name: string; label?: string }>;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchableSelect = ({
  items,
  value,
  onValueChange,
  placeholder = "Select an item",
  className,
}: SearchableSelectProps) => {
  // Format options for react-select
  const options = items.map(item => ({
    value: item.id,
    label: `${item.name} ${item.label ? item.label : ''}`.trim()
  }));

  // Find the selected option
  const selectedOption = options.find(option => option.value === value);

  // Custom styles to match shadcn/ui aesthetic
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      height: '40px',
      borderRadius: '0.375rem',
      borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)', 
      boxShadow: state.isFocused ? '0 0 0 2px var(--ring)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)',
      },
      backgroundColor: 'var(--background)',
      fontSize: '0.875rem',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--popover)',
      borderRadius: '0.375rem',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'var(--accent)' 
        : state.isFocused 
          ? 'var(--accent-subtle)' 
          : 'transparent',
      color: state.isSelected ? 'var(--accent-foreground)' : 'var(--foreground)',
      fontSize: '0.875rem',
      padding: '10px 12px',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'var(--accent)',
      },
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--foreground)',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--foreground)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: '0 8px',
      color: 'var(--muted-foreground)',
    }),
    clearIndicator: (provided) => ({
      ...provided,
      padding: '0 8px',
      color: 'var(--muted-foreground)',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
  };

  // Handle change
  const handleChange = (option) => {
    if (option) {
      onValueChange(option.value);
    }
  };

  return (
    <div className={cn(className)}>
      <Select
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        styles={customStyles}
        className="react-select-container"
        classNamePrefix="react-select"
        isSearchable={true}
        isClearable={false}
        menuPosition="fixed"
        noOptionsMessage={() => "Nenhum produto encontrado"}
      />
    </div>
  );
};
