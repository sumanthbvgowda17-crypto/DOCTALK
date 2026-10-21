import React from 'react';
import { clsx } from 'clsx';
import { Video, Mic, MessageSquare, PhoneCall, WifiOff, AlertTriangle, CheckCircle2, Clock, FileEdit } from 'lucide-react';
import { type CaseStatus, type ConsultationChannel, type NetworkQuality, type UrgencyLevel } from '../../types';

interface StatusBadgeProps {
  type: 'status' | 'urgency' | 'channel' | 'network';
  value: CaseStatus | UrgencyLevel | ConsultationChannel | NetworkQuality | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  value,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  if (type === 'status') {
    const status = value as CaseStatus;
    switch (status) {
      case 'in_review':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60', sizeClasses, className)}>
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            In Review
          </span>
        );
      case 'responded':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60', sizeClasses, className)}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Responded
          </span>
        );
      case 'submitted':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60', sizeClasses, className)}>
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            Submitted
          </span>
        );
      case 'pending_sync':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60', sizeClasses, className)}>
            <WifiOff className="w-3.5 h-3.5 text-orange-500" />
            Pending Sync
          </span>
        );
      case 'draft':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', sizeClasses, className)}>
            <FileEdit className="w-3.5 h-3.5 text-slate-500" />
            Draft
          </span>
        );
      case 'closed':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400', sizeClasses, className)}>
            Closed
          </span>
        );
    }
  }

  if (type === 'urgency') {
    const urgency = value as UrgencyLevel;
    switch (urgency) {
      case 'critical':
      case 'high':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60', sizeClasses, className)}>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            High Priority (Demo)
          </span>
        );
      case 'moderate':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60', sizeClasses, className)}>
            Moderate (Demo)
          </span>
        );
      case 'low':
      default:
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60', sizeClasses, className)}>
            Routine (Demo)
          </span>
        );
    }
  }

  if (type === 'channel') {
    const channel = value as ConsultationChannel;
    switch (channel) {
      case 'video':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60', sizeClasses, className)}>
            <Video className="w-3.5 h-3.5 text-indigo-500" />
            Video Mode
          </span>
        );
      case 'audio':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60', sizeClasses, className)}>
            <Mic className="w-3.5 h-3.5 text-cyan-600" />
            Audio Stream
          </span>
        );
      case 'chat':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60', sizeClasses, className)}>
            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
            Voice Note / Chat
          </span>
        );
      case 'sms':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300', sizeClasses, className)}>
            <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
            SMS / Call-back
          </span>
        );
    }
  }

  if (type === 'network') {
    const net = value as NetworkQuality;
    switch (net) {
      case 'good':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60', sizeClasses, className)}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Good Network
          </span>
        );
      case 'weak':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60', sizeClasses, className)}>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Weak (Fallback Audio)
          </span>
        );
      case 'very_weak':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60', sizeClasses, className)}>
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Very Weak (2G Chat)
          </span>
        );
      case 'offline':
        return (
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60', sizeClasses, className)}>
            <WifiOff className="w-3.5 h-3.5 text-rose-500" />
            Offline Mode
          </span>
        );
    }
  }

  return <span className={clsx('rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs', className)}>{value}</span>;
};
