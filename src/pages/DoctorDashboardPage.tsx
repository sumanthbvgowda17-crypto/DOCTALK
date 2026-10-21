import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Search,
  Activity,
  Heart,
  Thermometer
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const DoctorDashboardPage: React.FC = () => {
  const { doctorProfile, cases, updateCase, showToast } = useDemo();
  const navigate = useNavigate();

  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const pendingCases = cases.filter(c => c.status === 'submitted' || c.status === 'in_review');
  const reviewedCases = cases.filter(c => c.status === 'responded' || c.status === 'closed');
  const highPriorityCases = cases.filter(c => c.urgency === 'high' || c.urgency === 'critical');

  const templates = [
    'Recommend high oral fluid intake (ORS) and monitor body temperature every 4 hours. If fever crosses 102°F or breathlessness occurs, proceed to PHC.',
    'Symptoms appear consistent with mild seasonal upper respiratory infection. Steam inhalation twice daily and warm saline gargles recommended.',
    'Blood pressure reading is within acceptable maintenance range. Please continue prescribed morning antihypertensive as directed by your local MO.',
    'Dermatitis presentation noted. Avoid local herbal paste application. Keep area dry and visit clinic if itching worsens.'
  ];

  const handleApplyTemplate = (tmpl: string) => {
    setReplyText(tmpl);
  };

  const handleSimulateDoctorReply = () => {
    if (!replyText.trim() || !selectedCase) return;

    const newDoctorMessage = {
      id: `msg-${Date.now()}`,
      sender: 'doctor' as const,
      senderName: doctorProfile.name,
      text: replyText.trim(),
      timestamp: new Date().toISOString()
    };

    updateCase(selectedCase.id, prev => ({
      ...prev,
      messages: [...prev.messages, newDoctorMessage],
      doctorNotes: replyText.trim(),
      status: 'responded',
      updatedAt: new Date().toISOString()
    }));

    showToast({
      type: 'success',
      title: 'Clinical Advice Transmitted',
      message: `Reply recorded for Case ${selectedCase.id}. Reflected immediately on patient dashboard.`
    });

    setReplyText('');
  };

  const handleMarkInReview = () => {
    if (!selectedCase) return;
    updateCase(selectedCase.id, prev => ({
      ...prev,
      status: 'in_review',
      updatedAt: new Date().toISOString()
    }));
    showToast({
      type: 'info',
      title: `Case ${selectedCase.id} Marked In Review`
    });
  };

  // Queue Distribution Bar Chart
  const queueBarData = [
    { name: 'Submitted', count: cases.filter(c => c.status === 'submitted').length, color: '#06b6d4' },
    { name: 'In Review', count: cases.filter(c => c.status === 'in_review').length, color: '#f59e0b' },
    { name: 'Responded', count: cases.filter(c => c.status === 'responded').length, color: '#10b981' },
    { name: 'Pending Sync', count: cases.filter(c => c.status === 'pending_sync').length, color: '#f97316' },
  ];

  return (
    <div className="space-y-6">
      {/* Clinician Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-teal-600/15 via-cyan-600/10 to-slate-800/5 border border-teal-200/80 dark:border-teal-800/50 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Central Tele-Triage Desk • Bengaluru Hub
            </span>
            <span className="w-1 h-1 rounded-full bg-teal-500"></span>
            <span className="text-xs text-slate-500">Mandya & Kodagu Rural Circles</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Welcome, {doctorProfile.name} 🩺
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Review incoming offline-synced triage dossiers, provide rapid preliminary advice, and adjust case resolution states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/doctor/queue')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all shrink-0"
          >
            <Layers className="w-4 h-4" />
            <span>Full Triage Queue ({pendingCases.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Review"
          value={pendingCases.length}
          subtitle="Awaiting clinician reply"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          badge={<StatusBadge type="status" value="in_review" size="sm" />}
          onClick={() => navigate('/doctor/queue')}
        />
        <StatCard
          title="Cases Responded"
          value={reviewedCases.length}
          subtitle="Advice dispatched"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          trend={{ value: '100% resolution', isPositive: true }}
        />
        <StatCard
          title="Average Response Time"
          value="14 mins"
          subtitle="Fast-path triage queue"
          icon={<Activity className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />}
        />
        <StatCard
          title="High Priority"
          value={highPriorityCases.length}
          subtitle="Urgent triage tags"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          badge={<span className="text-[10px] text-rose-600 font-bold">Priority Desk</span>}
        />
      </div>

      {/* Main Review Cockpit: Left Case Queue Selector + Right Detail Review & Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Case Queue List */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-sm">
                Incoming Intake Queue
              </h3>
              <span className="text-xs text-slate-400">
                {cases.length} total cases
              </span>
            </div>

            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search patient, symptoms, ID..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {cases
                .filter(c => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(c => {
                  const isSelected = c.id === selectedCase?.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 shadow-xs'
                          : 'bg-white/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300">
                          {c.id}
                        </span>
                        <StatusBadge type="status" value={c.status} size="sm" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {c.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        <span>{c.patientName} ({c.patientAge}y)</span>
                        <span className="uppercase font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                          {c.language}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </GlassCard>

          {/* Mini Queue Distribution Chart */}
          <GlassCard className="p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Queue Status Summary
            </h4>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={queueBarData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {queueBarData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Right Column (7 cols): Selected Case Inspection & Response Composer */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCase ? (
            <>
              {/* Case Summary Header Card */}
              <GlassCard className="p-5 border-teal-200/80 dark:border-teal-900/60 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300">
                        {selectedCase.id}
                      </span>
                      <StatusBadge type="urgency" value={selectedCase.urgency} size="sm" />
                      <StatusBadge type="channel" value={selectedCase.channel} size="sm" />
                    </div>
                    <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white mt-1">
                      {selectedCase.title}
                    </h3>
                  </div>

                  <div className="flex gap-2">
                    {selectedCase.status === 'submitted' && (
                      <button
                        onClick={handleMarkInReview}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                      >
                        Start Review
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/cases/${selectedCase.id}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-50"
                    >
                      Open Case Room
                    </button>
                  </div>
                </div>

                {/* Patient Profile & Symptoms */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {selectedCase.patientName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedCase.patientAge}y, {selectedCase.patientGender}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Symptom Duration</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {selectedCase.duration}
                    </span>
                    <span className="text-[11px] text-slate-500">Primary: {selectedCase.reason}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Intake Language</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block uppercase">
                      {selectedCase.language}
                    </span>
                    <span className="text-[11px] text-slate-500">Auto-translated demo</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Reported Symptoms:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCase.symptoms.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/60 text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vitals preview if present */}
                {selectedCase.vitalsDemo && (
                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>BP: <strong>{selectedCase.vitalsDemo.bloodPressure}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Thermometer className="w-4 h-4 text-teal-500" />
                      <span>Temp: <strong>{selectedCase.vitalsDemo.temperature}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Activity className="w-4 h-4 text-cyan-500" />
                      <span>Pulse: <strong>{selectedCase.vitalsDemo.heartRate} bpm</strong></span>
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Predefined Response Templates & Clinical Reply Composer */}
              <GlassCard className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-heading font-bold text-slate-900 dark:text-white text-sm">
                    Simulate Clinician Response
                  </h4>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Updates Patient Dashboard Immediately
                  </span>
                </div>

                {/* Quick Templates Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Quick Clinical Response Templates:
                  </label>
                  <div className="space-y-1.5">
                    {templates.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="w-full text-left p-2 rounded-xl text-xs bg-slate-50 hover:bg-teal-50/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700 transition-colors truncate text-slate-700 dark:text-slate-200"
                      >
                        <span className="font-semibold text-teal-700 dark:text-teal-400 mr-1.5">#{idx + 1}</span>
                        {tmpl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Composer Textarea */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Custom Advice Text:
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Enter clinical notes, home care advice, or medication instructions..."
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={handleSimulateDoctorReply}
                    disabled={!replyText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Advice to Patient</span>
                  </button>
                </div>
              </GlassCard>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select a case from the incoming queue to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
