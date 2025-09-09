import React, { forwardRef } from "react";
import clsx from "clsx";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning" | "info";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "default",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium " +
      "transition-all duration-200 focus:outline-none " +
      "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none " +
      "whitespace-nowrap ";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      default: "bg-card border border-border text-fg hover:bg-muted",
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      outline: "border border-border text-fg hover:bg-muted",
      ghost: "text-fg hover:bg-muted",
      danger: "border-red-600 border text-red-500 hover:bg-card/90",
      success: "bg-transparent border border-emerald-600 text-emerald-500 hover:bg-card/90",
      warning: "bg-yellow-500 text-white hover:bg-yellow-600",
      info: "bg-blue-500 text-white hover:bg-blue-600",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-5 text-base",
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        className={clsx(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-live="polite"
        {...props}
      >
        {/* Ícone à esquerda (oculto quando loading) */}
        {!loading && leftIcon}

        {/* Conteúdo principal (mantém layout estável) */}
        <span className={clsx(loading && "opacity-0")}>{children}</span>

        {/* Loader sobreposto (evita pulo visual) */}
        {loading && (
          <span
            className="absolute inline-flex items-center"
            aria-hidden="true"
          >
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </span>
        )}

        {/* Ícone à direita (oculto quando loading) */}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
