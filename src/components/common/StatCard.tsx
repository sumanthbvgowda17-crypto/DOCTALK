import type { FC, ReactNode } from 'react';
import { GlassCard } from './GlassCard';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  badge?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  trend,
  onClick,
  className
}) => {
  return (
    <GlassCard
      interactive={!!onClick}
      onClick={onClick}
      className={clsx('p-5 flex flex-col justify-between relative group', className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            {title}
          </span>
          <div className="mt-2 text-2xl lg:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
            {value}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-cyan-50/80 text-cyan-600 border border-cyan-100 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-800/60 shadow-sm transition-transform group-hover:scale-105">
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-slate-500 dark:text-slate-400 truncate">
            {subtitle}
          </span>
        )}
        {trend && (
          <span
            className={clsx(
              'font-semibold inline-flex items-center gap-0.5',
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {trend.value}
          </span>
        )}
        {badge}
      </div>
    </GlassCard>
  );
};
