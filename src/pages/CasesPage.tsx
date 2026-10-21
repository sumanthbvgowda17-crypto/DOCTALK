import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import {
  FolderHeart,
  Search,
  PlusCircle,
  RefreshCw,
  ArrowRight,
  WifiOff
} from 'lucide-react';

export const CasesPage: React.FC = () => {
  const { cases, pendingSyncCount, simulateSync, isSyncing, networkQuality } = useDemo();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'urgency'>('recent');

  const filteredCases = cases.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.patientName.toLowerCase().includes(q) ||
        c.symptoms.some(s => s.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      const urgencyRank: Record<string, number> = { high: 3, moderate: 2, low: 1 };
      return (urgencyRank[b.urgency] || 0) - (urgencyRank[a.urgency] || 0);
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <FolderHeart className="w-4 h-4" />
            <span>Health Dossiers</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Patient Case Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Decentralized records stored locally with automatic triage synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {pendingSyncCount > 0 && (
            <button
              onClick={simulateSync}
              disabled={isSyncing || networkQuality === 'offline'}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync {pendingSyncCount} Pending</span>
            </button>
          )}

          <button
            onClick={() => navigate('/consultations/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Case</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Case ID (DOC-...), symptom, or patient..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Statuses ({cases.length})</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="responded">Responded</option>
              <option value="pending_sync">Pending Sync</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="py-1.5 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="recent">Sort by Most Recent</option>
              <option value="urgency">Sort by Urgency (Demo)</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Cases Grid */}
      {filteredCases.length === 0 ? (
        <EmptyState
          title="No case records found"
          description="Try clearing your search terms or filters to view all stored patient cases."
          actionText="Create New Case"
          onAction={() => navigate('/consultations/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map(c => (
            <GlassCard
              key={c.id}
              interactive
              onClick={() => navigate(`/cases/${c.id}`)}
              className="p-5 flex flex-col justify-between border-slate-200/90 dark:border-slate-800"
            >
              <div>
                {/* Header row: ID, Urgency, Status */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-400">
                      {c.id}
                    </span>
                    <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                      {c.title}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge type="status" value={c.status} size="sm" />
                    <StatusBadge type="urgency" value={c.urgency} size="sm" />
                  </div>
                </div>

                {/* Symptoms Badges */}
                <div className="flex flex-wrap gap-1.5 my-3">
                  {c.symptoms.slice(0, 3).map((sym, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium"
                    >
                      {sym}
                    </span>
                  ))}
                  {c.symptoms.length > 3 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{c.symptoms.length - 3} more
                    </span>
                  )}
                </div>

                {/* Doctor Note Snippet if available */}
                {c.doctorNotes ? (
                  <div className="p-2.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/60 text-xs mb-3">
                    <span className="font-semibold text-teal-800 dark:text-teal-300">Doctor Note: </span>
                    <span className="text-slate-600 dark:text-slate-300 italic line-clamp-1">
                      "{c.doctorNotes}"
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic mb-3">
                    Awaiting doctor triage assessment
                  </div>
                )}
              </div>

              {/* Footer info: Sync status, Channel, Time */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <StatusBadge type="channel" value={c.channel} size="sm" />
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {c.language}
                  </span>
                  {c.syncStatus !== 'synced' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      <WifiOff className="w-3 h-3" /> Queued
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
