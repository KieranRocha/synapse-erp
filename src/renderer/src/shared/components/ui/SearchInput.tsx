import React, { forwardRef } from 'react';
import { Loader2, Search, Check, X } from 'lucide-react';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  isLoading?: boolean;
  hasValue?: boolean;
  showSuccess?: boolean;
  onClear?: () => void;
  leftIcon?: React.ReactNode;
  rightActions?: React.ReactNode;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    isLoading, 
    hasValue, 
    showSuccess, 
    onClear, 
    leftIcon,
    rightActions,
    className = '',
    ...props 
  }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type="text"
          className={`
            w-full px-3 py-2 rounded-lg border border-border bg-input text-fg text-sm 
            outline-none focus:ring-2 focus:ring-ring/40 transition-colors
            ${leftIcon ? 'pl-10' : ''}
            ${rightActions || isLoading || showSuccess || onClear ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
          
          {showSuccess && !isLoading && (
            <Check className="w-4 h-4 text-emerald-600" />
          )}
          
          {onClear && hasValue && !isLoading && (
            <button
              type="button"
              onClick={onClear}
              className="p-0.5 hover:bg-muted rounded-full"
              title="Limpar"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
          
          {rightActions}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';