import React from 'react';
import { cn } from '@renderer/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onCheckedChange, disabled = false, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex  border-2 h-6 w-11 items-center rounded-full transition-colors',
        checked
          ? 'border-green-500 '
          : ' border-red-500',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full  transition-transform',
          checked ? 'translate-x-5.5 bg-green-500 ' : 'translate-x-1 bg-red-500'
        )}
      />
    </button>
  );
}