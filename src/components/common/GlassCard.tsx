import React, { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  subtle?: boolean;
  onClick?: () => void;
  id?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  interactive = false,
  subtle = false,
  onClick,
  id
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={twMerge(
        clsx(
          'rounded-2xl transition-all duration-200 overflow-hidden',
          subtle ? 'glass-panel-subtle' : 'glass-panel',
          interactive && 'glass-card-interactive cursor-pointer',
          className
        )
      )}
    >
      {children}
    </div>
  );
};
