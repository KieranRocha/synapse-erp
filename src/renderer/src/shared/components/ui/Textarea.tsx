import React, { forwardRef } from 'react';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ rows = 3, className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring transition-colors rounded-lg border border-input bg-card text-sm placeholder:text-muted-foreground resize-none ${className}`}
        rows={rows}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';