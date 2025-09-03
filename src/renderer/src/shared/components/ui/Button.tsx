import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 rounded-lg font-medium 
      transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/40
      disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none
    `;
    
    const variants = {
      default: 'bg-card border border-border text-fg hover:bg-muted',
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      outline: 'border border-border text-fg hover:bg-muted',
      ghost: 'text-fg hover:bg-muted',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    
    const sizes = {
      sm: 'px-2 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';