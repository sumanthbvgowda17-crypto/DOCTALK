import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { EmptyState } from '../components/common/EmptyState';
import {
  Bell,
  CheckCheck,
  Trash2,
  Radio,
  FileText,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import type { DemoNotification } from '../types';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications } = useDemo();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread' && n.isRead) return false;
    if (activeTab === 'read' && !n.isRead) return false;
    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryIcon = (cat: DemoNotification['category']) => {
    switch (cat) {
      case 'Case Updates':
        return <FileText className="w-4 h-4 text-cyan-600" />;
      case 'Connection':
        return <Radio className="w-4 h-4 text-teal-600" />;
      case 'Consultation':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'System':
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleItemClick = (n: DemoNotification) => {
    markNotificationAsRead(n.id);
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Alerts & Logs</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Notifications Centre
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Triage replies, network degradation warnings, and background offline sync receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-cyan-600" />
            <span>Mark All as Read</span>
          </button>
          <button
            onClick={() => setIsConfirmingClear(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
            {(['all', 'unread', 'read'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({tab === 'all' ? notifications.length : notifications.filter(n => tab === 'unread' ? !n.isRead : n.isRead).length})
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="py-1 px-3 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              <option value="Case Updates">Case Updates</option>
              <option value="Connection">Connection</option>
              <option value="Consultation">Consultation</option>
              <option value="System">System</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          title="No notifications to show"
          description="You are completely up-to-date with case triage and sync telemetry."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(n => (
            <GlassCard
              key={n.id}
              interactive
              onClick={() => handleItemClick(n)}
              className={`p-4 flex items-start gap-3.5 transition-all ${
                !n.isRead
                  ? 'border-cyan-300/80 bg-cyan-50/20 dark:border-cyan-800/60 dark:bg-cyan-950/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                {getCategoryIcon(n.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {n.category}
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{n.timestamp}</span>
                </div>

                <h4 className={`text-sm ${!n.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                  {n.title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {n.link && (
                <div className="self-center p-2 text-cyan-600 dark:text-cyan-400 opacity-60 group-hover:opacity-100">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmingClear}
        title="Clear All Notifications?"
        message="This will remove all demo notifications from your view. This cannot be undone."
        confirmLabel="Clear Notifications"
        isDestructive
        onConfirm={() => {
          clearNotifications();
          setIsConfirmingClear(false);
        }}
        onCancel={() => setIsConfirmingClear(false)}
      />
    </div>
  );
};
