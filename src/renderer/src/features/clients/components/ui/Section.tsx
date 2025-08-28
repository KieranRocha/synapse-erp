import React from 'react';

interface SectionProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function Section({ title, subtitle, icon, children }: SectionProps) {
  return (
    <section className="bg-card border border-border rounded-2xl">
      <header className="px-4 md:px-5 py-3 border-b border-border flex items-center gap-2">
        {icon}
        <div>
          <h3 className="font-semibold leading-tight">{title}</h3>
          {subtitle && <p className="text-xs opacity-70 mt-0.5">{subtitle}</p>}
        </div>
      </header>
      <div className="px-4 md:px-5 py-4">{children}</div>
    </section>
  );
}