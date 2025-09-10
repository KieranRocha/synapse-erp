import React from 'react';

interface SectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export function Section({ 
  title, 
  subtitle, 
  icon, 
  children, 
  className = '',
  headerClassName = '',
  bodyClassName = ''
}: SectionProps) {
  return (
    <section className={`bg-card border border-border rounded-2xl ${className}`}>
      <header className={`px-4 md:px-5 py-3 border-b border-border flex items-center gap-2 ${headerClassName}`}>
        {icon}
        <div>
          <h3 className="font-semibold leading-tight text-fg">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </header>
      <div className={`px-4 md:px-5 py-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}