import React, { forwardRef } from 'react';
import { cn } from '../../../lib/utils';

// Native select component with black background styling
const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full px-3 py-2 border border-gray-700 bg-bg text-fg rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

// Compatibility exports (not used with native select, but kept for backwards compatibility)
const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectValue = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
const SelectTrigger = Select; // Alias for compatibility
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectLabel = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectItem = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <option value={value}>{children}</option>
);
const SelectSeparator = () => null;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
