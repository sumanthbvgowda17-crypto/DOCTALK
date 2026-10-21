import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import {
  Search,
  PlusCircle,
  X,
  Radio
} from 'lucide-react';
import type { Consultation } from '../types';

export const ConsultationsPage: React.FC = () => {
  const { consultations } = useDemo();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'waiting' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const filteredConsultations = consultations.filter(c => {
    // Tab filter
    if (activeTab !== 'all' && c.status !== activeTab) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        c.title.toLowerCase().includes(q) ||
        c.caseId.toLowerCase().includes(q) ||
        c.doctorName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      if (!matches) return false;
    }
    // Channel filter
    if (channelFilter !== 'all' && c.channel !== channelFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Tele-Consultation Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resilient telemedicine sessions designed to maintain care across fluctuating rural signals.
          </p>
        </div>

        <button
          onClick={() => navigate('/consultations/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all transform active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Consultation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-full md:w-auto overflow-x-auto">
            {(['all', 'active', 'waiting', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab}
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({tab === 'all' ? consultations.length : consultations.filter(c => c.status === tab).length})
                </span>
              </button>
            ))}
          </div>

          {/* Search & Channel Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search case, doctor, ID..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Channels</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="chat">Voice Note / Chat</option>
              <option value="sms">SMS Fallback</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Consultations Content: Table for Desktop & Cards for Mobile */}
      {filteredConsultations.length === 0 ? (
        <EmptyState
          title="No consultations found"
          description="No consultation records match your selected filter. Start a new consultation or adjust search."
          actionText="Start New Consultation"
          onAction={() => navigate('/consultations/new')}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <GlassCard className="p-0 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-3 px-4 font-semibold">Consultation / Case</th>
                    <th className="py-3 px-4 font-semibold">Doctor</th>
                    <th className="py-3 px-4 font-semibold">Channel & Bandwidth</th>
                    <th className="py-3 px-4 font-semibold">Schedule</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
                  {filteredConsultations.map(c => (
                    <tr key={c.id} className="hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          ID: <span className="font-mono text-cyan-700 dark:text-cyan-400">{c.id}</span> • Case Ref: {c.caseId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{c.doctorName}</div>
                        <div className="text-[11px] text-slate-400">{c.specialty}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge type="channel" value={c.channel} size="sm" />
                        <div className="text-[10px] text-slate-400 mt-1 max-w-[180px] truncate">
                          {c.networkSummary || 'Adaptive stream'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{c.scheduledFor}</div>
                        <div className="text-[11px] text-slate-400">{c.durationMinutes || 15} mins allocated</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' :
                          c.status === 'waiting' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300' :
                          c.status === 'completed' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300' :
                          'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedConsultation(c)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          Quick View
                        </button>
                        <button
                          onClick={() => navigate(`/cases/${c.caseId}`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-colors"
                        >
                          Open Room
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredConsultations.map(c => (
              <GlassCard key={c.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {c.title}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Case: {c.caseId} • {c.id}
                    </p>
                  </div>
                  <StatusBadge type="channel" value={c.channel} size="sm" />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Doctor:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{c.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Schedule:</span>
                    <span className="text-slate-700 dark:text-slate-300">{c.scheduledFor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 uppercase text-[10px]">{c.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setSelectedConsultation(c)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => navigate(`/cases/${c.caseId}`)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 text-white"
                  >
                    Open Case
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      {/* Consultation Quick Detail Drawer Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg">
            <GlassCard className="p-6 border border-white/80 dark:border-slate-700 shadow-2xl">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Telemedicine Session Spec
                  </span>
                  <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    {selectedConsultation.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Session: {selectedConsultation.id} • Attached to Case: {selectedConsultation.caseId}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedConsultation(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <span className="text-slate-400 text-[11px]">Assigned Clinician:</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedConsultation.doctorName}</p>
                    <p className="text-slate-500">{selectedConsultation.specialty}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Channel Mode:</span>
                    <div className="mt-1">
                      <StatusBadge type="channel" value={selectedConsultation.channel} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900">
                  <span className="font-bold text-cyan-900 dark:text-cyan-300 text-xs flex items-center gap-1.5 mb-1">
                    <Radio className="w-4 h-4 text-cyan-600" />
                    Zero-Drop Telemetry Guarantee
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedConsultation.networkSummary || 'DocTalk utilizes adaptive media layering. If packet drop exceeds 15%, video frames automatically halt while crystal clear audio continues without interruption.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => navigate('/connection')}
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Simulate Network Drop
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedConsultation(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const caseId = selectedConsultation.caseId;
                      setSelectedConsultation(null);
                      navigate(`/cases/${caseId}`);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs"
                  >
                    Open Case Room
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
