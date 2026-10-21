import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Activity,
  FileCheck,
  WifiOff
} from 'lucide-react';
import type { CaseRecord, ConsultationChannel, Language, UrgencyLevel } from '../types';

export const NewConsultationPage: React.FC = () => {
  const { profile, addCase, networkQuality, activeFallbackChannel } = useDemo();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [reason, setReason] = useState<string>('Respiratory & Fever');
  const [customReason, setCustomReason] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    'Persistent dry cough',
    'Mild evening fever'
  ]);
  const [customSymptomInput, setCustomSymptomInput] = useState<string>('');
  const [duration, setDuration] = useState<string>('3 to 5 days');
  const [notes, setNotes] = useState<string>('');
  const [language, setLanguage] = useState<Language>(profile.preferredLanguage || 'kn');
  const [channel, setChannel] = useState<ConsultationChannel>(activeFallbackChannel || 'audio');
  const [urgencyEstimate, setUrgencyEstimate] = useState<UrgencyLevel>('moderate');

  const reasonOptions = [
    { id: 'Respiratory & Fever', label: 'Respiratory & Fever', icon: '🫁', desc: 'Cough, chest congestion, chills, seasonal flu' },
    { id: 'Skin & Allergy', label: 'Skin Rash & Allergies', icon: '🌿', desc: 'Itching, dermatitis, hives, insect bites' },
    { id: 'Acute Pain / Fever', label: 'High Fever & Joint Pain', icon: '🌡️', desc: 'Suspected viral, dengue, or malaria symptoms' },
    { id: 'Chronic Care', label: 'Hypertension / Diabetes Check', icon: '🩺', desc: 'Routine pressure check, regular refill review' },
    { id: 'General Triage', label: 'Other General Health Question', icon: '📋', desc: 'Non-emergency primary health guidance' },
  ];

  const commonSymptomChips = [
    'Persistent dry cough',
    'Mild evening fever',
    'Body ache & fatigue',
    'Headache',
    'Sore throat',
    'Skin rash with itch',
    'Stomach ache / nausea',
    'High fever (>101°F)',
    'Loss of appetite',
  ];

  const durationOptions = [
    '< 24 hours (Sudden onset)',
    '1 to 2 days',
    '3 to 5 days',
    '1 to 2 weeks',
    '> 2 weeks (Long-standing)'
  ];

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const addCustomSymptom = () => {
    if (customSymptomInput.trim() && !selectedSymptoms.includes(customSymptomInput.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptomInput.trim()]);
      setCustomSymptomInput('');
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !reason) return;
    if (currentStep === 2 && selectedSymptoms.length === 0) {
      alert('Please select or enter at least one symptom.');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    const caseId = `DOC-${Math.floor(2000 + Math.random() * 7900)}`;
    const effectiveReason = reason === 'General Triage' && customReason ? customReason : reason;

    const isOffline = networkQuality === 'offline';

    const newCase: CaseRecord = {
      id: caseId,
      patientName: profile.name,
      patientAge: profile.age,
      patientGender: profile.gender,
      title: `${effectiveReason} - ${selectedSymptoms[0] || 'Intake'}`,
      reason: effectiveReason,
      symptoms: selectedSymptoms,
      duration,
      notes: notes.trim() || undefined,
      language,
      channel,
      status: isOffline ? 'pending_sync' : 'submitted',
      urgency: urgencyEstimate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: isOffline ? 'pending' : 'synced',
      vitalsDemo: {
        bloodPressure: '122/80 mmHg',
        heartRate: 76,
        spo2: 98,
        temperature: '99.0 °F',
        lastUpdated: 'At intake',
        isFictionalSample: true
      },
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'patient',
          senderName: profile.name,
          text: `Demo Consultation registered. Primary concern: ${effectiveReason}. Symptoms reported: ${selectedSymptoms.join(', ')} (${duration}).`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    addCase(newCase);
    navigate(`/cases/${caseId}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4" />
          <span>New Patient Consultation</span>
        </div>
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
          Multi-Step Clinical Intake
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Step-by-step triage formatted for low-bandwidth rural health clinics.
        </p>
      </div>

      {/* Progress Steps Header */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
          {[
            { num: 1, label: 'Reason' },
            { num: 2, label: 'Symptoms' },
            { num: 3, label: 'Language & Mode' },
            { num: 4, label: 'Review & Submit' },
          ].map(step => (
            <div key={step.num} className="flex flex-col items-center bg-transparent z-10 px-2">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                  currentStep === step.num
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 scale-105'
                    : currentStep > step.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                currentStep === step.num ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Network Notice if Offline */}
      {networkQuality === 'offline' && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Offline Mode Detected:</strong> Your case will be saved securely to browser localStorage and automatically queued for transmission once connectivity is restored.
          </div>
        </div>
      )}

      {/* Step 1: Select Consultation Reason */}
      {currentStep === 1 && (
        <GlassCard className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
            Step 1: Select Primary Consultation Reason
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose the category that best represents what you want to discuss with the doctor today.
          </p>

          <div className="grid grid-cols-1 gap-3 pt-2">
            {reasonOptions.map(opt => (
              <div
                key={opt.id}
                onClick={() => setReason(opt.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  reason === opt.id
                    ? 'bg-cyan-50/70 border-cyan-500 shadow-xs dark:bg-cyan-950/40 dark:border-cyan-400'
                    : 'bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700 hover:border-cyan-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs">{opt.icon}</span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{opt.label}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  reason === opt.id ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-slate-300'
                }`}>
                  {reason === opt.id && <Check className="w-3 h-3" />}
                </div>
              </div>
            ))}
          </div>

          {reason === 'General Triage' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Specify Reason (Optional)
              </label>
              <input
                type="text"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="e.g. Mild ear pain after swimming..."
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}
        </GlassCard>
      )}

      {/* Step 2: Symptoms and Duration */}
      {currentStep === 2 && (
        <GlassCard className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
            Step 2: Enter Symptoms and Duration
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select matching symptoms or enter your own. You can select multiple.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Common Symptoms (Click to toggle):
            </label>
            <div className="flex flex-wrap gap-2">
              {commonSymptomChips.map(sym => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-cyan-600 text-white shadow-xs font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Symptom Input */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={customSymptomInput}
              onChange={e => setCustomSymptomInput(e.target.value)}
              placeholder="Add another symptom and press Add..."
              className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomSymptom();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomSymptom}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300"
            >
              Add
            </button>
          </div>

          {/* Duration Selector */}
          <div className="pt-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              How long have you had these symptoms?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {durationOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDuration(opt)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                    duration === opt
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Additional Details / Medication History (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Took 1 paracetamol yesterday. Works in outdoor agriculture fields."
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </GlassCard>
      )}

      {/* Step 3: Preferred Language & Mode */}
      {currentStep === 3 && (
        <GlassCard className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
            Step 3: Language and Communication Mode
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your preferred consultation language and network delivery channel.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Preferred Language for Doctor Dialogue:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', note: 'Full vernacular support' },
                { code: 'hi', name: 'हिन्दी (Hindi)', note: 'Hindi triage support' },
                { code: 'en', name: 'English', note: 'Standard medical format' },
              ].map(lang => (
                <div
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as Language)}
                  className={`p-3.5 rounded-xl border cursor-pointer text-center transition-all ${
                    language === lang.code
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-sm font-bold">{lang.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{lang.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Preferred Channel (Auto-adapts dynamically to connection):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { ch: 'audio', title: 'HD Audio', badge: 'Recommended for 3G' },
                { ch: 'video', title: 'Video Stream', badge: 'Best on 4G/WiFi' },
                { ch: 'chat', title: 'Voice Note & Chat', badge: 'Low 2G signal' },
                { ch: 'sms', title: 'SMS / Call-back', badge: 'Offline queue' },
              ].map(c => (
                <button
                  key={c.ch}
                  type="button"
                  onClick={() => setChannel(c.ch as ConsultationChannel)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    channel === c.ch
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">{c.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{c.badge}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Illustrative Urgency Estimate (Demo):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { level: 'low', label: 'Routine (Low)', desc: 'Mild symptoms' },
                { level: 'moderate', label: 'Moderate', desc: 'Need doctor input within 2 hrs' },
                { level: 'high', label: 'Urgent (High)', desc: 'Active high fever or discomfort' },
              ].map(u => (
                <button
                  key={u.level}
                  type="button"
                  onClick={() => setUrgencyEstimate(u.level as UrgencyLevel)}
                  className={`p-2.5 rounded-xl border text-left text-xs ${
                    urgencyEstimate === u.level
                      ? 'border-amber-500 bg-amber-50/60 text-amber-900 font-bold dark:bg-amber-950 dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div>{u.label}</div>
                  <div className="text-[10px] text-slate-400">{u.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Step 4: Review and Submit */}
      {currentStep === 4 && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>Step 4: Intake Verification</span>
          </div>
          <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
            Review Your Consultation Details
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please verify your information before transmitting. Your case will be assigned to Dr. Anita Rao at the Central Tele-Triage Hub.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 text-xs space-y-2.5">
            <div className="flex justify-between pt-1">
              <span className="text-slate-400 font-medium">Patient Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">{profile.name} ({profile.age}y, {profile.gender})</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400 font-medium">Primary Reason:</span>
              <span className="font-bold text-cyan-700 dark:text-cyan-400">{reason}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400 font-medium">Reported Symptoms:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-xs">{selectedSymptoms.join(', ')}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400 font-medium">Duration:</span>
              <span className="text-slate-700 dark:text-slate-300">{duration}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400 font-medium">Consultation Language:</span>
              <span className="font-bold text-slate-900 dark:text-white uppercase">{language}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400 font-medium">Adaptive Channel:</span>
              <span className="font-semibold text-teal-700 dark:text-teal-400 uppercase">{channel}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400 font-medium">Storage & Sync Mode:</span>
              <span className="font-bold text-emerald-600">
                {networkQuality === 'offline' ? 'Offline Local Draft (Queued)' : 'Online Instant Dispatch'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-800 text-[11px] text-cyan-900 dark:text-cyan-200 leading-relaxed">
            <strong>Demonstration Notice:</strong> Submitting creates a real local mock record. You will be able to review this case from both the Patient Dashboard and the Doctor Triage Queue.
          </div>
        </GlassCard>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div></div>
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20 transition-all transform active:scale-95"
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg shadow-cyan-600/25 transition-all transform active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Open Case</span>
          </button>
        )}
      </div>
    </div>
  );
};
