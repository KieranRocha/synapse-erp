import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', size = 'md', className = '', disabled = false, ...props }, ref) => {
    const baseStyles = 'w-full rounded-lg border text-fg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors';
    
    const variants = {
      default: 'border-input bg-card hover:border-input/80',
      error: 'border-danger bg-card focus:ring-danger/20'
    };
    
    const sizes = {
      sm: 'px-2 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm', 
      lg: 'px-4 py-3 text-base'
    };
    
    const disabledStyles = disabled ? 'opacity-60 cursor-not-allowed bg-muted' : '';
    
    return (
      <input
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';