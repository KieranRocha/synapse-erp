import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ 
  label, 
  error, 
  hint, 
  required = false, 
  className = '',
  children 
}: FormFieldProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-xs opacity-70 mb-1">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs text-danger mt-1">{error}</span>
      )}
      {hint && !error && (
        <span className="text-xs text-muted-foreground mt-1">{hint}</span>
      )}
    </div>
  );
}