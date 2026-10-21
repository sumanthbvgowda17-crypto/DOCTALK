import React, { type ReactNode } from 'react';
import { GlassCard } from './GlassCard';
import { FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <GlassCard className={`p-10 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-100 dark:border-cyan-800/80 mb-4 shadow-sm">
        {icon || <FolderSearch className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-medium text-sm shadow-sm transition-all transform active:scale-95"
        >
          {actionText}
        </button>
      )}
    </GlassCard>
  );
};
