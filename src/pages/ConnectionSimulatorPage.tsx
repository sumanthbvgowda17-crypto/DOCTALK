import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { GlassCard } from '../components/common/GlassCard';
import { sendTwilioSms } from '../lib/twilioService';
import {
  Radio,
  WifiOff,
  RefreshCw,
  Video,
  Mic,
  MessageSquare,
  PhoneCall,
  CheckCircle2,
  Clock,
  Database,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import type { NetworkQuality, CaseRecord } from '../types';

export const ConnectionSimulatorPage: React.FC = () => {
  const {
    networkQuality,
    setNetworkQuality,
    simulateSync,
    isSyncing,
    cases,
    addCase
  } = useDemo();

  const [historyLog, setHistoryLog] = useState<
    { timestamp: string; from: NetworkQuality; to: NetworkQuality; fallbackAction: string }[]
  >([
    {
      timestamp: '10 mins ago',
      from: 'good',
      to: 'weak',
      fallbackAction: 'Seamlessly switched video feed to OPUS 28 kbps audio stream without dropping caller.'
    }
  ]);

  const [smsPhoneDemo, setSmsPhoneDemo] = useState('+91 98450 12345');
  const [smsTriggered, setSmsTriggered] = useState(false);

  const networkProfiles: Record<
    NetworkQuality,
    {
      label: string;
      bars: number;
      latency: string;
      packetLoss: string;
      bandwidth: string;
      channel: string;
      icon: any;
      bg: string;
      color: string;
      explanation: string;
    }
  > = {
    good: {
      label: 'Good (4G / High-Speed Broadband)',
      bars: 4,
      latency: '28 ms',
      packetLoss: '0.1%',
      bandwidth: '1850 kbps',
      channel: 'Video Demo (720p H.264)',
      icon: Video,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      color: 'text-emerald-700 dark:text-emerald-300',
      explanation: 'Optimal bandwidth available. Full bi-directional video consultation stream active.'
    },
    weak: {
      label: 'Weak Signal (3G / Variable Rural Tower)',
      bars: 2,
      latency: '240 ms',
      packetLoss: '6.4%',
      bandwidth: '48 kbps',
      channel: 'HD Audio Demo (OPUS Low-Bitrate)',
      icon: Mic,
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      color: 'text-amber-700 dark:text-amber-300',
      explanation: 'Video frames suspended automatically. Crystal clear voice stream maintained with zero call disruption.'
    },
    very_weak: {
      label: 'Very Weak (2G / Edge / Deep Forest)',
      bars: 1,
      latency: '1100 ms',
      packetLoss: '24.2%',
      bandwidth: '9.6 kbps',
      channel: 'Voice Note & Structured Chat Demo',
      icon: MessageSquare,
      bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
      color: 'text-orange-700 dark:text-orange-300',
      explanation: 'Interactive voice call gracefully replaced by store-and-forward voice clips and compressed text triage.'
    },
    offline: {
      label: 'Offline (Zero Signal / Transit / Disaster)',
      bars: 0,
      latency: '∞ (No route)',
      packetLoss: '100%',
      bandwidth: '0 kbps',
      channel: 'Local SQLite/Browser Storage Queue',
      icon: WifiOff,
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      color: 'text-rose-700 dark:text-rose-300',
      explanation: 'Clinical notes and symptoms saved immediately to device storage. Auto-sync engine transmits when connection resumes.'
    }
  };

  const currentProfile = networkProfiles[networkQuality];

  const handleSelectNetwork = (newQuality: NetworkQuality) => {
    if (newQuality === networkQuality) return;
    const prev = networkQuality;
    setNetworkQuality(newQuality);

    const logEntry = {
      timestamp: 'Just now',
      from: prev,
      to: newQuality,
      fallbackAction: `Mode changed to ${newQuality.toUpperCase()}. Fallback adjusted to ${networkProfiles[newQuality].channel}.`
    };
    setHistoryLog(prevLogs => [logEntry, ...prevLogs.slice(0, 5)]);
  };

  const handleAddFictionalPendingCase = () => {
    const randomId = `DOC-${Math.floor(8000 + Math.random() * 1900)}`;
    const mockCase: CaseRecord = {
      id: randomId,
      patientName: 'Chandrashekar H.',
      patientAge: 51,
      patientGender: 'Male',
      title: 'Rural Field Triage - Gastrointestinal Pain',
      reason: 'Acute Abdominal Discomfort',
      symptoms: ['Cramping abdominal pain', 'Nausea after unboiled well water'],
      duration: '12 hours',
      language: 'kn',
      channel: 'audio',
      status: 'pending_sync',
      urgency: 'moderate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'patient',
          senderName: 'Chandrashekar H.',
          text: 'ಹೊಟ್ಟೆಯಲ್ಲಿ ತೀವ್ರ ನೋವು ಕಾಣಿಸಿಕೊಂಡಿದೆ. (Experiencing acute stomach cramps).',
          timestamp: new Date().toISOString()
        }
      ]
    };
    addCase(mockCase);
  };

  const handleTriggerSmsCallback = async () => {
    setSmsTriggered(true);
    await sendTwilioSms({
      to: smsPhoneDemo,
      body: `DocTalk Alert: Dr. Anita Rao will call ${smsPhoneDemo} within 15 minutes. Reference ID: DOC-${Math.floor(1000 + Math.random() * 9000)}.`
    });
    setTimeout(() => {
      setSmsTriggered(false);
    }, 6000);
  };

  const handleResetSimulation = () => {
    setNetworkQuality('good');
    setHistoryLog([
      {
        timestamp: 'Just now',
        from: networkQuality,
        to: 'good',
        fallbackAction: 'Simulation parameters reset to high-speed broadband baseline.'
      }
    ]);
  };

  const pendingCases = cases.filter(c => c.syncStatus !== 'synced');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Core Tele-Resilience Engine</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Connection & Fallback Simulator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Demonstrating DocTalk's patent-pending tiered graceful degradation architecture.
          </p>
        </div>

        <button
          onClick={handleResetSimulation}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Main Network Quality Selector Card */}
      <GlassCard className="p-6 border-cyan-200/80 dark:border-cyan-800/60 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
            1. Select Network Environment:
          </h3>
          <span className="text-[11px] text-slate-500">
            Click any network tier to trigger real-time UI adaptation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(['good', 'weak', 'very_weak', 'offline'] as const).map(quality => {
            const p = networkProfiles[quality];
            const isSelected = networkQuality === quality;
            return (
              <button
                key={quality}
                type="button"
                onClick={() => handleSelectNetwork(quality)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 relative ${
                  isSelected
                    ? `${p.bg} shadow-md ring-2 ring-cyan-500 scale-[1.02]`
                    : 'bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700 hover:border-cyan-300'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-cyan-600 animate-ping"></span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  {/* Signal bars graphic */}
                  <div className="flex items-end gap-0.5 h-4">
                    <div className={`w-1 h-1.5 rounded-xs ${p.bars >= 1 ? 'bg-cyan-600' : 'bg-slate-300'}`}></div>
                    <div className={`w-1 h-2.5 rounded-xs ${p.bars >= 2 ? 'bg-cyan-600' : 'bg-slate-300'}`}></div>
                    <div className={`w-1 h-3.5 rounded-xs ${p.bars >= 3 ? 'bg-cyan-600' : 'bg-slate-300'}`}></div>
                    <div className={`w-1 h-4.5 rounded-xs ${p.bars >= 4 ? 'bg-cyan-600' : 'bg-slate-300'}`}></div>
                  </div>
                  <span className="font-extrabold text-xs uppercase text-slate-900 dark:text-white">
                    {quality.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {p.label.split('(')[0]}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Active: {p.channel.split('(')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Live Telemetry & Active Fallback Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Fallback Mode Details */}
        <GlassCard className="p-5 lg:col-span-2 flex flex-col justify-between border-cyan-200/80 dark:border-cyan-800/60">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-600" />
                <h4 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                  Active Fallback Engine State
                </h4>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${currentProfile.bg} ${currentProfile.color}`}>
                {networkQuality.toUpperCase()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900 mb-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-cyan-600 text-white shadow-sm">
                  {React.createElement(currentProfile.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <div className="text-xs uppercase font-extrabold tracking-wider text-cyan-700 dark:text-cyan-400">
                    Engine Recommendation
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentProfile.channel}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {currentProfile.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Network Telemetry Gauges */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Network Latency</span>
                <span className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-0.5 block">
                  {currentProfile.latency}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Packet Loss</span>
                <span className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-0.5 block">
                  {currentProfile.packetLoss}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Data Bitrate</span>
                <span className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-0.5 block">
                  {currentProfile.bandwidth}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-4 text-[11px] text-neutral-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
            <span>Active carrier metrics and telemetry streaming across cellular base stations.</span>
          </div>
        </GlassCard>

        {/* Right: SMS / Basic-Phone IVR Fallback */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-3">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <h4 className="font-heading font-bold text-neutral-900 dark:text-white text-sm">
                2G Feature Phone SMS Fallback
              </h4>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              When internet connectivity is completely unavailable, DocTalk generates an automated summary SMS / voice IVR callback order to basic feature phones.
            </p>

            <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2 mb-4">
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                Patient Mobile Number:
              </label>
              <input
                type="text"
                value={smsPhoneDemo}
                onChange={e => setSmsPhoneDemo(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={handleTriggerSmsCallback}
                className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black font-bold text-xs shadow-xs transition-colors"
              >
                Dispatch SMS via Twilio
              </button>
            </div>

            {smsTriggered && (
              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 animate-in fade-in">
                <strong>SMS Dispatched via Twilio:</strong> "DocTalk Alert: Dr. Anita Rao will call {smsPhoneDemo} within 15 minutes. Reference ID: DOC-7821."
              </div>
            )}
          </div>

          <div className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            Zero reliance on smartphones for extreme remote access.
          </div>
        </GlassCard>
      </div>

      {/* Offline Pending-Case Queue & Sync Engine */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-600" />
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                Local Offline Queue (Browser Persistence)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cases entered while disconnected are preserved locally in browser localStorage until synchronized.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleAddFictionalPendingCase}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              + Add Mock Offline Case
            </button>
            <button
              onClick={simulateSync}
              disabled={isSyncing || networkQuality === 'offline'}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing Payload...' : 'Simulate Cloud Sync'}</span>
            </button>
          </div>
        </div>

        {pendingCases.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">
              All Cases Synchronized
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No offline drafts pending. Click "+ Add Mock Offline Case" or create a consultation to test offline queuing.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{pendingCases.length} case(s) waiting in browser storage:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingCases.map(c => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 flex items-start justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-300">
                      {c.id}
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                      {c.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Patient: {c.patientName} • Queued at: {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    Offline Draft
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Network Mode Timeline History */}
      <GlassCard className="p-5">
        <h4 className="font-heading font-bold text-slate-900 dark:text-white text-sm mb-3">
          Session Network Transition Timeline
        </h4>
        <div className="space-y-2">
          {historyLog.map((log, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between text-xs gap-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0"></span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Transition: {log.from.toUpperCase()} → {log.to.toUpperCase()}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {log.fallbackAction}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
