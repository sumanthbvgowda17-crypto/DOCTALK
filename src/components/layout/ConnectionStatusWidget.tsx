import React from 'react';
import { useDemo } from '../../context/DemoContext';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

export const ConnectionStatusWidget: React.FC = () => {
  const { networkQuality, pendingSyncCount, isSyncing, simulateSync } = useDemo();
  const navigate = useNavigate();

  const getStatusBadge = () => {
    switch (networkQuality) {
      case 'good':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500 animate-pulse',
          label: '4G/WiFi Online',
          mode: 'Video'
        };
      case 'weak':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500',
          label: 'Weak Signal',
          mode: 'Audio'
        };
      case 'very_weak':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
          dot: 'bg-orange-500',
          label: '2G Low Bandwidth',
          mode: 'Chat'
        };
      case 'offline':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
          dot: 'bg-rose-500',
          label: 'Offline (Queued)',
          mode: 'Local Draft'
        };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate('/connection')}
        title="Click to open Network & Fallback Simulator"
        className={clsx(
          'flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:shadow-sm group',
          status.bg
        )}
      >
        <span className={clsx('w-2 h-2 rounded-full shrink-0', status.dot)}></span>
        <span className="hidden sm:inline">{status.label}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 ml-0.5">
          {status.mode}
        </span>
      </button>

      {pendingSyncCount > 0 && (
        <button
          onClick={simulateSync}
          disabled={isSyncing || networkQuality === 'offline'}
          title={networkQuality === 'offline' ? 'Cannot sync offline. Restore network first.' : 'Simulate sync with triage hub'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5 text-amber-600 dark:text-amber-400', isSyncing && 'animate-spin')} />
          <span className="font-semibold">{pendingSyncCount}</span>
          <span className="hidden md:inline">pending sync</span>
        </button>
      )}
    </div>
  );
};
