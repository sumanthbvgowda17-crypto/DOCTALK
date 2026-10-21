import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import { GlassCard } from '../components/common/GlassCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ArrowLeft,
  Heart,
  Send,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Image,
  Paperclip,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import type { CaseStatus } from '../types';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cases, updateCase, role, profile, simulateSync, isSyncing, networkQuality } = useDemo();

  const caseData = cases.find(c => c.id.toLowerCase() === id?.toLowerCase());

  const [newMessageText, setNewMessageText] = useState('');
  const [editingDoctorNotes, setEditingDoctorNotes] = useState(caseData?.doctorNotes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  if (!caseData) {
    return (
      <div className="py-12 text-center">
        <GlassCard className="p-8 max-w-md mx-auto">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            Case Record Not Found
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Could not locate case ID: {id} in local storage.
          </p>
          <button
            onClick={() => navigate('/cases')}
            className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-semibold"
          >
            Back to All Cases
          </button>
        </GlassCard>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: (role === 'doctor' ? 'doctor' : 'patient') as 'doctor' | 'patient',
      senderName: profile.name,
      text: newMessageText.trim(),
      timestamp: new Date().toISOString()
    };

    updateCase(caseData.id, prev => ({
      ...prev,
      messages: [...prev.messages, newMsg],
      updatedAt: new Date().toISOString(),
      status: role === 'doctor' && prev.status === 'in_review' ? 'responded' : prev.status
    }));

    setNewMessageText('');
  };

  const handleSaveDoctorNotes = () => {
    updateCase(caseData.id, prev => ({
      ...prev,
      doctorNotes: editingDoctorNotes.trim(),
      status: 'responded',
      updatedAt: new Date().toISOString()
    }));
    setIsEditingNotes(false);
  };

  const handleStatusChange = (newStatus: CaseStatus) => {
    updateCase(caseData.id, prev => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }));
  };

  const timelineSteps: { status: CaseStatus; label: string }[] = [
    { status: 'draft', label: 'Draft' },
    { status: 'submitted', label: 'Submitted' },
    { status: 'in_review', label: 'In Review' },
    { status: 'responded', label: 'Responded' },
    { status: 'closed', label: 'Closed' },
  ];

  const getStatusStepIndex = (st: CaseStatus) => {
    if (st === 'pending_sync') return 1;
    const idx = timelineSteps.findIndex(s => s.status === st);
    return idx === -1 ? 1 : idx;
  };

  const currentStepIndex = getStatusStepIndex(caseData.status);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-cyan-600 dark:text-cyan-400">
                {caseData.id}
              </span>
              <StatusBadge type="status" value={caseData.status} size="sm" />
              <StatusBadge type="urgency" value={caseData.urgency} size="sm" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white mt-0.5">
              {caseData.title}
            </h2>
          </div>
        </div>

        {/* Sync or Status Actions */}
        <div className="flex items-center gap-2">
          {caseData.syncStatus !== 'synced' ? (
            <button
              onClick={simulateSync}
              disabled={isSyncing || networkQuality === 'offline'}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Simulate Sync</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Synced with Triage Hub
            </span>
          )}

          {role === 'doctor' && (
            <select
              value={caseData.status}
              onChange={e => handleStatusChange(e.target.value as CaseStatus)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
            >
              <option value="in_review">Mark In Review</option>
              <option value="responded">Mark Responded</option>
              <option value="closed">Mark Closed</option>
            </select>
          )}
        </div>
      </div>

      {/* Case Lifecycle Timeline */}
      <GlassCard className="p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Case Status Progress
        </h4>
        <div className="flex items-center justify-between relative px-2 sm:px-6">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 -z-10"></div>
          {timelineSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.status} className="flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-cyan-600 text-white ring-4 ring-cyan-100 dark:ring-cyan-950'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[11px] font-semibold mt-1.5 text-center ${
                  isCurrent ? 'text-cyan-700 dark:text-cyan-400' : isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Symptoms, Vitals, Messages Thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* Intake Overview Card */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                  Intake Dossier
                </h3>
                <p className="text-xs text-slate-500">
                  Recorded on {new Date(caseData.createdAt).toLocaleDateString()} at {new Date(caseData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-300">
                  Lang: {caseData.language}
                </span>
                <StatusBadge type="channel" value={caseData.channel} size="sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1.5">
                Reported Symptoms:
              </span>
              <div className="flex flex-wrap gap-2">
                {caseData.symptoms.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60 text-xs font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Reported Duration:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{caseData.duration}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Patient Details:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {caseData.patientName} ({caseData.patientAge}y, {caseData.patientGender})
                </span>
              </div>
            </div>

            {caseData.notes && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 block mb-1 font-semibold">Additional Patient Notes:</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{caseData.notes}</p>
              </div>
            )}
          </GlassCard>

          {/* Vitals Card */}
          {caseData.vitalsDemo && (
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <h4 className="font-heading font-bold text-slate-900 dark:text-white text-sm">
                    Intake Vitals & Biometrics
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Blood Pressure</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">
                    {caseData.vitalsDemo.bloodPressure}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Heart Rate</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">
                    {caseData.vitalsDemo.heartRate} bpm
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Temperature</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">
                    {caseData.vitalsDemo.temperature}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">SpO2 Oxygen</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">
                    {caseData.vitalsDemo.spo2}%
                  </span>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Interactive Case Discussion Thread */}
          <GlassCard className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-600" />
                <h4 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                  Consultation Messages & Doctor Dialogue
                </h4>
              </div>
              <span className="text-xs text-slate-400">
                {caseData.messages.length} message{caseData.messages.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Messages stream */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-4">
              {caseData.messages.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No messages yet. Send a clinical note or reply below.
                </div>
              ) : (
                caseData.messages.map(msg => {
                  const isDoc = msg.sender === 'doctor';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isDoc ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {msg.senderName}
                        </span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-md leading-relaxed ${
                          isDoc
                            ? 'bg-teal-600 text-white rounded-tr-xs shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/80 dark:border-slate-700'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Composer */}
            <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={e => setNewMessageText(e.target.value)}
                placeholder={`Type a message as ${role === 'doctor' ? 'Dr. Anita Rao' : profile.name}...`}
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={!newMessageText.trim()}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Column (1 Col): Doctor Notes, Attached Files Demo, Safety Notice */}
        <div className="space-y-6">
          {/* Doctor Assessment / Clinical Notes Panel */}
          <GlassCard className="p-5 border-teal-200/80 dark:border-teal-900/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                Doctor Assessment
              </span>
              {role === 'doctor' && (
                <button
                  onClick={() => {
                    if (isEditingNotes) {
                      handleSaveDoctorNotes();
                    } else {
                      setIsEditingNotes(true);
                    }
                  }}
                  className="text-xs text-teal-700 dark:text-teal-400 font-bold hover:underline"
                >
                  {isEditingNotes ? 'Save' : 'Edit'}
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={editingDoctorNotes}
                  onChange={e => setEditingDoctorNotes(e.target.value)}
                  placeholder="Enter clinical assessment, prescription, and patient advice..."
                  className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 text-slate-800 dark:text-slate-100"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="px-3 py-1 rounded-lg text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDoctorNotes}
                    className="px-3 py-1 rounded-lg text-xs bg-teal-600 text-white font-bold"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : caseData.doctorNotes ? (
              <div className="p-3.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                "{caseData.doctorNotes}"
              </div>
            ) : (
              <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400">
                {role === 'doctor'
                  ? 'No clinical notes added yet. Click Edit to enter clinical advice.'
                  : 'Pending clinical assessment from Dr. Anita Rao.'}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              Assigned Hub: Bengaluru Central Tele-Medicine Desk
            </div>
          </GlassCard>

          {/* Attached Files Demo Placeholders */}
          <GlassCard className="p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              Attached Records (Demo Placeholders)
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-cyan-600" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      Rash_forearm_photo.jpg
                    </span>
                    <span className="text-[10px] text-slate-400">842 KB • JPEG image</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                  Verified
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      Previous_Rx_Scan.pdf
                    </span>
                    <span className="text-[10px] text-slate-400">1.2 MB • PDF Document</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                  Attached
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Emergency Helpline Card */}
          <GlassCard className="p-5 border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-neutral-600 dark:text-neutral-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase">
                  Emergency Support
                </h4>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  If you are experiencing an acute medical emergency, please dial your local emergency services (108 / 112 in India) or visit your nearest primary health clinic immediately.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
