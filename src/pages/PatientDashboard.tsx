import React from 'react';
import { useDemo } from '../context/DemoContext';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Activity,
  Calendar,
  Heart,
  MessageSquare,
  PlusCircle,
  Radio,
  Stethoscope,
  Thermometer,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export const PatientDashboard: React.FC = () => {
  const { profile, cases, consultations, networkQuality, activeFallbackChannel } = useDemo();
  const navigate = useNavigate();

  const activeConsultation = consultations.find(c => c.status === 'active') || consultations[0];
  const latestCaseWithResponse = cases.find(c => c.status === 'responded' || c.messages.some(m => m.sender === 'doctor')) || cases[0];

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Weekly Trend Chart Data
  const weeklyTrendData = [
    { day: 'Mon', sessions: 2, offlineSynced: 1 },
    { day: 'Tue', sessions: 3, offlineSynced: 2 },
    { day: 'Wed', sessions: 4, offlineSynced: 0 },
    { day: 'Thu', sessions: 2, offlineSynced: 1 },
    { day: 'Fri', sessions: 5, offlineSynced: 3 },
    { day: 'Sat', sessions: 3, offlineSynced: 1 },
    { day: 'Sun', sessions: 4, offlineSynced: 2 },
  ];

  // Channel Distribution Data
  const channelData = [
    { name: 'Video', count: cases.filter(c => c.channel === 'video').length + 4, color: '#6366f1' },
    { name: 'Audio (Low-BW)', count: cases.filter(c => c.channel === 'audio').length + 7, color: '#06b6d4' },
    { name: 'Voice/Chat', count: cases.filter(c => c.channel === 'chat').length + 5, color: '#14b8a6' },
    { name: 'SMS Queue', count: cases.filter(c => c.channel === 'sms').length + 3, color: '#94a3b8' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Persona Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-cyan-600/10 via-teal-500/10 to-emerald-500/10 border border-cyan-200/60 dark:border-cyan-800/40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              {currentDateFormatted}
            </span>
            <span className="w-1 h-1 rounded-full bg-cyan-500"></span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Mandya Rural District, Karnataka
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
            Namaskara, {profile.name}! 👋
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Welcome to your zero-drop telemedicine dashboard. If connectivity drops during consultations, DocTalk seamlessly switches to HD audio or queues your clinical notes locally.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/consultations/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Consultation</span>
          </button>
          <button
            onClick={() => navigate('/triage')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>Symptom Triage</span>
          </button>
          <button
            onClick={() => navigate('/cases')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
          >
            <span>View Cases</span>
          </button>
        </div>
      </div>

      {/* Top Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Sessions"
          value={consultations.filter(c => c.status === 'active' || c.status === 'waiting').length}
          subtitle="Tele-triage pipeline"
          icon={<Calendar className="w-5 h-5" />}
          trend={{ value: 'Zero Call Drops', isPositive: true }}
          onClick={() => navigate('/consultations')}
        />
        <StatCard
          title="Total Cases"
          value={cases.length}
          subtitle="Saved in local demo store"
          icon={<Activity className="w-5 h-5" />}
          badge={<StatusBadge type="status" value="in_review" size="sm" />}
          onClick={() => navigate('/cases')}
        />
        <StatCard
          title="Network Resilience"
          value={networkQuality === 'offline' ? 'Offline' : networkQuality === 'good' ? '4G Full' : 'Adapted'}
          subtitle={`Current channel: ${activeFallbackChannel.toUpperCase()}`}
          icon={<Radio className="w-5 h-5" />}
          trend={{ value: 'Simulator Active', isPositive: true }}
          onClick={() => navigate('/connection')}
        />
        <StatCard
          title="Preferred Language"
          value="Kannada & EN"
          subtitle="Multi-lingual intake ready"
          icon={<MessageSquare className="w-5 h-5" />}
          onClick={() => navigate('/account')}
        />
      </div>

      {/* Primary Highlights: Resilient Call Box + Latest Doctor Response */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Consultation Spotlight */}
        <GlassCard className="p-5 flex flex-col justify-between border-cyan-200/80 dark:border-cyan-800/60 lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Current Tele-Consultation
                </span>
              </div>
              <StatusBadge type="channel" value={activeConsultation?.channel || 'audio'} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/50 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  AR
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                    {activeConsultation?.doctorName || 'Dr. Anita Rao'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeConsultation?.specialty || 'General Medicine & Pulmonology'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">
                      Case: {activeConsultation?.caseId || 'DOC-7821'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[11px] text-slate-500">
                      {activeConsultation?.scheduledFor || 'Today, 4:30 PM'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-cyan-100 dark:border-cyan-900">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Adaptive Bandwidth:
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  High Resilience (28 kbps)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {activeConsultation?.networkSummary || 'OPUS audio transmission active with sub-second jitter buffer. Doctor is reviewing your reported cough symptoms.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">
              Demo audio link connected to Bangalore Tele-Health Hub
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/consultations')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                All Consultations
              </button>
              <button
                onClick={() => navigate(`/cases/${activeConsultation?.caseId || 'DOC-7821'}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-colors"
              >
                <span>Open Case Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Latest Doctor Response Preview */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Latest Doctor Advice
              </span>
            </div>

            {latestCaseWithResponse ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {latestCaseWithResponse.title}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3">
                    "{latestCaseWithResponse.doctorNotes || latestCaseWithResponse.messages.find(m => m.sender === 'doctor')?.text || 'Doctor reviewed symptoms. Continue hydration and monitor temperature.'}"
                  </p>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Case Ref:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{latestCaseWithResponse.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span>1 hour ago</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">
                No doctor replies yet. Use "New Consultation" to start!
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={() => navigate(`/cases/${latestCaseWithResponse?.id || 'DOC-7821'}`)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline py-1"
            >
              <span>View Full Clinical Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Health Profile Vitals Section */}
      <GlassCard className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                Patient Health Profile & Biometric Vitals
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Logged biometric parameters and historical vitals stored locally for offline clinical review.
            </p>
          </div>
          <span className="text-[11px] text-slate-400">
            Last Telemetry Sync: Today, 3:15 PM
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-medium mb-1">
              <Heart className="w-4 h-4" />
              <span>Blood Pressure</span>
            </div>
            <div className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
              124/82 <span className="text-xs font-normal text-slate-400">mmHg</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">
              Normal range (Demo)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-medium mb-1">
              <Activity className="w-4 h-4" />
              <span>Pulse / Heart Rate</span>
            </div>
            <div className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
              78 <span className="text-xs font-normal text-slate-400">bpm</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Resting rhythm
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-medium mb-1">
              <Thermometer className="w-4 h-4" />
              <span>Body Temp</span>
            </div>
            <div className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
              99.4 <span className="text-xs font-normal text-slate-400">°F</span>
            </div>
            <div className="text-[10px] text-amber-600 font-semibold mt-1">
              Mild low-grade
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-1">
              <Activity className="w-4 h-4" />
              <span>Oxygen Saturation</span>
            </div>
            <div className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
              97% <span className="text-xs font-normal text-slate-400">SpO2</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">
              Adequate
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Charts Section: Weekly Consultations & Channel Resilience Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                Weekly Consultation Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total consultations vs offline local syncs
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Live Calls
              </span>
              <span className="flex items-center gap-1.5 text-teal-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span> Offline Synced
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="sessions" stroke="#0891b2" strokeWidth={2.5} fillOpacity={1} fill="url(#cyanGradient)" />
                <Area type="monotone" dataKey="offlineSynced" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#tealGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Illustrative sample telemetry for demonstration purposes.
          </p>
        </GlassCard>

        {/* Channel Usage Bar Chart */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                Channel Distribution & Fallback Adaptations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown of consultations adapted by signal strength
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Zero Drop
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Video: 4G</span>
            <span>Audio: 3G fallback</span>
            <span>Chat: 2G voice notes</span>
            <span>SMS: 0 bar queue</span>
          </div>
        </GlassCard>
      </div>

      {/* Recent Consultations List Table */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
              Recent Consultation Records
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synchronized sessions with your clinical care team
            </p>
          </div>
          <button
            onClick={() => navigate('/consultations')}
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="pb-3 font-semibold">Case & Title</th>
                <th className="pb-3 font-semibold">Doctor / Clinician</th>
                <th className="pb-3 font-semibold">Channel</th>
                <th className="pb-3 font-semibold">Schedule / Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {consultations.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pr-2">
                    <div className="font-bold text-slate-900 dark:text-white">{c.title}</div>
                    <div className="text-[11px] text-slate-400">ID: {c.caseId} • {c.id}</div>
                  </td>
                  <td className="py-3 pr-2">
                    <div className="font-medium">{c.doctorName}</div>
                    <div className="text-[11px] text-slate-400">{c.specialty}</div>
                  </td>
                  <td className="py-3 pr-2">
                    <StatusBadge type="channel" value={c.channel} size="sm" />
                  </td>
                  <td className="py-3 pr-2">
                    <div className="font-medium">{c.scheduledFor}</div>
                    <div className="mt-0.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        c.status === 'waiting' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        c.status === 'completed' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => navigate(`/cases/${c.caseId}`)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 font-semibold text-xs border border-cyan-200/60 dark:border-cyan-800/60 transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
