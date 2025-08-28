import React, { forwardRef } from 'react';

interface InputProps {
  placeholder?: string;
  type?: string;
  autoCapitalize?: string;
  maxLength?: number;
  disabled?: boolean;
  readonly?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, type = "text", autoCapitalize, maxLength, disabled = false, readonly = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2 rounded-lg border border-input text-sm placeholder:text-muted-foreground/30 ${disabled || readonly ? 'bg-muted opacity-70 cursor-not-allowed' : 'bg-card'
          }`}
        placeholder={placeholder}
        type={type}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readonly}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';