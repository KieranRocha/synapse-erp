import React from 'react';

interface HintProps {
  children: React.ReactNode;
}

export function Hint({ children }: HintProps) {
  return <p className="text-[11px] opacity-60">{children}</p>;
}

export function Divider() {
  return <div className="h-px bg-border" />;
}