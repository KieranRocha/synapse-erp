import { forwardRef } from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  className?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ options, value, onChange, name, className = '' }, ref) => {
    return (
      <div ref={ref} className={`flex gap-3 ${className}`}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange?.(option.value)}
              className={`
                px-4 py-2 rounded-lg border text-sm font-medium transition-all
                ${
                  isSelected
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-card text-fg hover:bg-muted'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                    ${
                      isSelected
                        ? 'border-primary'
                        : 'border-border'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <span>{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
