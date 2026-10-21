import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import {
  Layers,
  Search,
  Stethoscope
} from 'lucide-react';
import type { CaseStatus } from '../types';

export const DoctorQueuePage: React.FC = () => {
  const { cases, updateCase, showToast } = useDemo();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCases = cases.filter(c => {
    if (urgencyFilter !== 'all' && c.urgency !== urgencyFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.patientName.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.symptoms.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleQuickStatusUpdate = (caseId: string, newStatus: CaseStatus) => {
    updateCase(caseId, prev => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }));
    showToast({
      type: 'info',
      title: `Case ${caseId} Status Updated`,
      message: `New state: ${newStatus.toUpperCase()}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Clinical Queue Matrix</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Doctor Triage Case Queue
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Incoming patient dossiers prioritized by urgency, vernacular language, and transmission status.
          </p>
        </div>

        <button
          onClick={() => navigate('/doctor')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all shrink-0"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Workspace Overview</span>
        </button>
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
              placeholder="Filter by ID (DOC-...), patient name, or symptom keyword..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority Only</option>
              <option value="moderate">Moderate Priority</option>
              <option value="low">Routine</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="responded">Responded</option>
              <option value="pending_sync">Pending Sync</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Queue Table */}
      {filteredCases.length === 0 ? (
        <EmptyState
          title="No queue items match your filter"
          description="Try selecting 'All Priorities' or clearing search keywords."
          actionText="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setUrgencyFilter('all');
            setStatusFilter('all');
          }}
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-4 font-semibold">Priority & ID</th>
                <th className="py-3 px-4 font-semibold">Patient & Chief Complaint</th>
                <th className="py-3 px-4 font-semibold">Language</th>
                <th className="py-3 px-4 font-semibold">Channel</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {filteredCases.map(c => (
                <tr key={c.id} className="hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300">
                        {c.id}
                      </span>
                      <StatusBadge type="urgency" value={c.urgency} size="sm" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {c.patientName} <span className="text-slate-400 font-normal">({c.patientAge}y, {c.patientGender})</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
                      {c.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Duration: {c.duration}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {c.language}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge type="channel" value={c.channel} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge type="status" value={c.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {c.status === 'submitted' && (
                      <button
                        onClick={() => handleQuickStatusUpdate(c.id, 'in_review')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                      >
                        Claim Case
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/cases/${c.id}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors"
                    >
                      Review & Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
};
