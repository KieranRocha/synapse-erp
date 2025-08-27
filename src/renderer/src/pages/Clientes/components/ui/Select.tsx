import React, { forwardRef } from 'react';

interface SelectProps {
  options: string[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';