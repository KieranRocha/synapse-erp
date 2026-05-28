import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'admin' | 'vendas' | 'compras' | 'estoque' | 'financeiro' | 'success' | 'warning' | 'danger' | 'secondary';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full border';

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  const variantClasses = {
    default: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    admin: 'bg-purple-700/8 text-purple-500 border-purple-700',
    vendas: 'bg-green-100 text-green-800 border-green-200',
    compras: 'bg-blue-100 text-blue-800 border-blue-200',
    estoque: 'bg-orange-100 text-orange-800 border-orange-200',
    financeiro: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    secondary: 'bg-bg text-fg border-neutral-200',
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};