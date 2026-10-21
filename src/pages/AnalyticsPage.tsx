import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { GlassCard } from '../components/common/GlassCard';
import { StatCard } from '../components/common/StatCard';
import {
  BarChart3,
  Activity,
  Calendar,
  Clock,
  CheckCircle2,
  PieChart as PieIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { cases, consultations } = useDemo();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  // KPI Metrics
  const totalConsultations = consultations.length + 8;
  const completedConsultations = consultations.filter(c => c.status === 'completed').length + 6;
  const pendingCasesCount = cases.filter(c => c.status === 'submitted' || c.status === 'in_review').length;
  const avgResponseTime = '12.4 min';

  // 7-day consultation volume trend
  const trendData = [
    { date: 'Oct 15', consultations: 6, offlineSyncs: 2, avgDuration: 14 },
    { date: 'Oct 16', consultations: 9, offlineSyncs: 3, avgDuration: 16 },
    { date: 'Oct 17', consultations: 12, offlineSyncs: 4, avgDuration: 13 },
    { date: 'Oct 18', consultations: 8, offlineSyncs: 1, avgDuration: 15 },
    { date: 'Oct 19', consultations: 15, offlineSyncs: 5, avgDuration: 12 },
    { date: 'Oct 20', consultations: 11, offlineSyncs: 3, avgDuration: 14 },
    { date: 'Oct 21', consultations: cases.length + 4, offlineSyncs: 2, avgDuration: 13 },
  ];

  // Channel distribution
  const channelData = [
    { name: 'HD Video', count: cases.filter(c => c.channel === 'video').length + 5, color: '#6366f1' },
    { name: 'Audio (Low-BW)', count: cases.filter(c => c.channel === 'audio').length + 8, color: '#06b6d4' },
    { name: 'Voice Notes/Chat', count: cases.filter(c => c.channel === 'chat').length + 6, color: '#14b8a6' },
    { name: 'SMS Queue', count: cases.filter(c => c.channel === 'sms').length + 3, color: '#94a3b8' },
  ];

  // Case Status Donut
  const statusPieData = [
    { name: 'Responded', value: cases.filter(c => c.status === 'responded').length + 4, color: '#10b981' },
    { name: 'In Review', value: cases.filter(c => c.status === 'in_review').length + 2, color: '#f59e0b' },
    { name: 'Submitted', value: cases.filter(c => c.status === 'submitted').length + 2, color: '#06b6d4' },
    { name: 'Pending Sync', value: cases.filter(c => c.status === 'pending_sync').length + 1, color: '#f97316' },
  ];

  // Response Time distribution
  const responseTimeData = [
    { slot: '< 5 min', count: 8 },
    { slot: '5-15 min', count: 14 },
    { slot: '15-30 min', count: 7 },
    { slot: '30-60 min', count: 3 },
    { slot: '> 1 hr', count: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Range Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Operational Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Telemedicine Analytics Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Network adaptation rates, channel degradation distribution, and response latencies.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {(['7d', '30d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                timeRange === range
                  ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All-Time'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Consultations"
          value={totalConsultations}
          subtitle="Processed via adaptive tiers"
          icon={<Calendar className="w-5 h-5 text-cyan-600" />}
          trend={{ value: '+18% this week', isPositive: true }}
        />
        <StatCard
          title="Completed Sessions"
          value={completedConsultations}
          subtitle="Zero dropped conversations"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          trend={{ value: '99.4% retention', isPositive: true }}
        />
        <StatCard
          title="Avg. Triage Speed"
          value={avgResponseTime}
          subtitle="Doctor review turnaround"
          icon={<Clock className="w-5 h-5 text-teal-600" />}
          trend={{ value: '-3 min faster', isPositive: true }}
        />
        <StatCard
          title="Pending Queue"
          value={pendingCasesCount}
          subtitle="Cases in review / sync"
          icon={<Activity className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Primary Graphs Row: 7-Day Trend + Channel Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart (7 cols) */}
        <GlassCard className="p-5 lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                Consultation Volume & Offline Recovery
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily live consultations compared to offline store-and-forward synchronizations
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-cyan-600">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Live Tele-Sessions
              </span>
              <span className="flex items-center gap-1.5 font-medium text-teal-600">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Offline Synced
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConsults" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorSyncs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="consultations" stroke="#0891b2" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConsults)" name="Live Sessions" />
                <Area type="monotone" dataKey="offlineSyncs" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorSyncs)" name="Offline Synced" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Channel Breakdown Bar Chart (5 cols) */}
        <GlassCard className="p-5 lg:col-span-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                Delivery Channel Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Media protocol selected during active sessions
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {channelData.map((entry, index) => (
                    <Cell key={`channel-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Secondary Graphs Row: Case Status Donut + Response Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Status Donut */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                Case Status Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current resolution state across all active patient records
              </p>
            </div>
            <PieIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Response Latency Histogram */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                Triage Response Latency
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribution of time elapsed before preliminary doctor advice
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">
              Target &lt; 20m
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="slot" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#71717a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
