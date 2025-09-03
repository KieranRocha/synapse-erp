import React, { forwardRef } from 'react';

interface TextareaProps {
  rows?: number;
  placeholder?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ rows = 3, placeholder, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm placeholder:text-muted-foreground resize-none"
        rows={rows}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';