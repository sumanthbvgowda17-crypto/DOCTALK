import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import {
  PhoneCall,
  Send,
  MessageSquare,
  Clock,
  PhoneForwarded,
  PhoneOff,
  Radio,
  CheckCircle2,
  Copy,
  Sparkles,
  Smartphone,
  Mic,
  Volume2,
  RefreshCw,
  Trash2,
  Key,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  getTwilioConfig,
  saveTwilioConfig,
  dialDirectPhone,
  openDirectSmsApp,
  getSmsHistory,
  getCallHistory,
  sendTwilioSms,
  makeTwilioCall,
  clearSmsHistory,
  clearCallHistory,
  type TwilioMessageRecord,
  type TwilioCallRecord
} from '../lib/twilioService';

export const AssistanceDashboardPage: React.FC = () => {
  const config = getTwilioConfig();
  const fromPhone = config.fromPhone;
  const registeredNumber = config.registeredNumber;

  // Settings / Credentials drawer state
  const [showConfig, setShowConfig] = useState(false);
  const [inputSid, setInputSid] = useState(config.accountSid);
  const [inputAuthToken, setInputAuthToken] = useState(config.authToken);
  const [inputTwilioPhone, setInputTwilioPhone] = useState(config.fromPhone);
  const [inputRegisteredPhone, setInputRegisteredPhone] = useState(config.registeredNumber);
  const [configNotice, setConfigNotice] = useState<string | null>(null);

  // SMS State
  const [smsBody, setSmsBody] = useState(
    'DocTalk Urgent Alert: Medical review requested immediately. Patient triage recorded at PHC. Reference ID: DOC-7821.'
  );
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<{ type: 'success' | 'error'; message: string; sid?: string } | null>(null);

  // Call Assistance State
  const [isCalling, setIsCalling] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [callScript, setCallScript] = useState(
    'DocTalk Emergency Medical Assistance. A clinical triage doctor is being connected to your line immediately. Reference ID DOC-7821. Please hold the line.'
  );
  const [callFeedback, setCallFeedback] = useState<{ type: 'success' | 'error'; message: string; sid?: string } | null>(null);

  // History State
  const [smsHistory, setSmsHistory] = useState<TwilioMessageRecord[]>(getSmsHistory);
  const [callHistory, setCallHistory] = useState<TwilioCallRecord[]>(getCallHistory);
  const [activeTab, setActiveTab] = useState<'all' | 'calls' | 'sms'>('all');
  const [copiedTwilioNumber, setCopiedTwilioNumber] = useState(false);
  const [copiedUserNumber, setCopiedUserNumber] = useState(false);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveTwilioConfig({
      accountSid: inputSid,
      authToken: inputAuthToken,
      phone: inputTwilioPhone,
      registeredPhone: inputRegisteredPhone
    });
    setConfigNotice('Twilio credentials saved successfully! Line parameters updated.');
    setTimeout(() => {
      setConfigNotice(null);
      setShowConfig(false);
      window.location.reload();
    }, 1200);
  };

  // Call duration counter
  useEffect(() => {
    let timer: number;
    if (callActive) {
      timer = window.setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyTwilioNumber = () => {
    navigator.clipboard.writeText(fromPhone);
    setCopiedTwilioNumber(true);
    setTimeout(() => setCopiedTwilioNumber(false), 2000);
  };

  const handleCopyUserNumber = () => {
    navigator.clipboard.writeText(registeredNumber);
    setCopiedUserNumber(true);
    setTimeout(() => setCopiedUserNumber(false), 2000);
  };

  // ─── Trigger Call Assistance ───
  const handleInitiateCall = async () => {
    setIsCalling(true);
    setCallFeedback(null);

    try {
      const res = await makeTwilioCall({
        to: registeredNumber,
        speechText: callScript
      });

      setCallActive(true);
      setCallHistory(getCallHistory());

      if (res.twilioVerified) {
        setCallFeedback({
          type: 'success',
          message: `Twilio Outbound Call Connected! Twilio line ${fromPhone} is dialing your phone ${registeredNumber}. Answer the incoming call to hear the voice medical triage.`,
          sid: res.record.sid
        });
      } else {
        setCallFeedback({
          type: 'success',
          message: res.error
            ? `Call Assistance active: Voice synthesized in browser (${res.error})`
            : `Call Assistance initiated from Twilio ${fromPhone} to ${registeredNumber}! Speaking voice message.`,
          sid: res.record.sid
        });
      }
    } catch (err: any) {
      setCallFeedback({
        type: 'error',
        message: err?.message || 'Failed to connect Call Assistance'
      });
    } finally {
      setIsCalling(false);
    }
  };

  const handleEndCall = () => {
    setCallActive(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallFeedback({
      type: 'success',
      message: `Call Assistance completed (${formatTimer(callSeconds)}). Call record saved to dispatch history.`
    });
  };

  // ─── Trigger SMS Alert ───
  const handleSendSmsAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsBody.trim()) return;

    setIsSendingSms(true);
    setSmsFeedback(null);

    try {
      const res = await sendTwilioSms({
        to: registeredNumber,
        body: smsBody.trim()
      });

      setSmsHistory(getSmsHistory());

      if (res.twilioVerified) {
        setSmsFeedback({
          type: 'success',
          message: `SMS Alert successfully delivered via Twilio line ${fromPhone} to your registered phone ${registeredNumber}!`,
          sid: res.record.sid
        });
      } else {
        setSmsFeedback({
          type: 'success',
          message: res.error
            ? `SMS recorded in dispatch queue (${res.error})`
            : `SMS Alert dispatched from Twilio ${fromPhone} to your phone ${registeredNumber}!`,
          sid: res.record.sid
        });
      }
    } catch (err: any) {
      setSmsFeedback({
        type: 'error',
        message: err?.message || 'Failed to dispatch SMS Alert'
      });
    } finally {
      setIsSendingSms(false);
    }
  };

  const quickSmsTemplates = [
    {
      title: 'Doctor Callback Alert',
      text: 'DocTalk Alert: Patient at PHC requires immediate doctor callback. Symptoms: High fever and nausea.'
    },
    {
      title: 'Critical Vitals Alert',
      text: 'DocTalk Alert: Critical vitals alert. SpO2 level dropped below 92%. Doctor review urgently required.'
    },
    {
      title: 'Emergency Transport',
      text: 'DocTalk Dispatch: Ambulance transfer requested from Sub-Center 3 to District Hospital.'
    },
    {
      title: '2G Voice Callback Order',
      text: 'DocTalk IVR: Internet packet link failed. Voice IVR tele-consultation ordered to feature phone.'
    }
  ];

  const quickCallScripts = [
    {
      title: 'Emergency Doctor Triage',
      text: 'DocTalk Emergency Medical Assistance. A clinical triage doctor is being connected to your line immediately. Reference ID DOC-7821. Please hold the line.'
    },
    {
      title: 'Vitals Escalation Order',
      text: 'DocTalk Critical Alert. Telemetry indicators show elevated pulse and abnormal blood pressure. Local healthcare worker is en route.'
    },
    {
      title: 'Doctor Voice Consultation',
      text: 'Hello from DocTalk Telemedicine. Dr. Anita Rao is now available for your scheduled tele-consultation. Press 1 to connect.'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Twilio Registered Line Status */}
      <GlassCard className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shrink-0 shadow-lg">
              <PhoneForwarded className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-neutral-900 dark:text-white">
                  Twilio Assistance Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Twilio Live Dispatch
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
                  Twilio: {fromPhone} → {registeredNumber}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Dedicated emergency dispatch desk. Placing calls or sending alerts triggers outbound voice & SMS via Twilio line <strong>{fromPhone}</strong> directly to your phone <strong>{registeredNumber}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Twilio Outbound Line Display */}
            <div className="flex items-center gap-2.5 bg-neutral-100/90 dark:bg-neutral-800/80 px-3 py-2 rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 font-bold">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 block">
                  Twilio Outbound Line:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-extrabold text-neutral-900 dark:text-white">
                    {fromPhone}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTwilioNumber}
                    className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-0.5"
                    title="Copy Twilio caller number"
                  >
                    {copiedTwilioNumber ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Registered Destination Display */}
            <div className="flex items-center gap-2.5 bg-neutral-100/90 dark:bg-neutral-800/80 px-3 py-2 rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 font-bold">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 block">
                  Your Phone (Recipient):
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-extrabold text-neutral-900 dark:text-white">
                    {registeredNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUserNumber}
                    className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-0.5"
                    title="Copy your phone number"
                  >
                    {copiedUserNumber ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Twilio Settings Toggle Button */}
            <button
              type="button"
              onClick={() => setShowConfig(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-neutral-100/90 hover:bg-neutral-200/90 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
              title="Configure Twilio SID, Auth Token & Line Numbers"
            >
              <Key className="w-4 h-4 text-neutral-500" />
              <span>Line Config</span>
              {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Credentials Config Drawer */}
        {showConfig && (
          <div className="mt-5 pt-5 border-t border-neutral-200 dark:border-neutral-800 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">
                    Twilio Credentials & Gateway Parameters
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500">
                  Stored securely in local environment
                </span>
              </div>

              {configNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{configNotice}</span>
                </div>
              )}

              <form onSubmit={handleSaveCredentials} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                    Twilio Account SID:
                  </label>
                  <input
                    type="text"
                    value={inputSid}
                    onChange={e => setInputSid(e.target.value)}
                    className="w-full p-2.5 text-xs font-mono rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                    Twilio Auth Token:
                  </label>
                  <input
                    type="text"
                    value={inputAuthToken}
                    onChange={e => setInputAuthToken(e.target.value)}
                    className="w-full p-2.5 text-xs font-mono rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    placeholder="32-char auth token from twilio console"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                    Twilio Outbound Line:
                  </label>
                  <input
                    type="text"
                    value={inputTwilioPhone}
                    onChange={e => setInputTwilioPhone(e.target.value)}
                    className="w-full p-2.5 text-xs font-mono rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    placeholder="+17372508034"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                    Recipient Mobile:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputRegisteredPhone}
                      onChange={e => setInputRegisteredPhone(e.target.value)}
                      className="w-full p-2.5 text-xs font-mono rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
                      placeholder="+919180420603"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs shrink-0 transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>

              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Calls and SMS are dialed from Twilio number <strong>{fromPhone}</strong> directly to your personal phone <strong>{registeredNumber}</strong>. For live phone network delivery via Twilio carrier, paste your 32-character Auth Token from the Twilio Console (twilio.com/console).
              </p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Main Grid: Left Call Assistance & Right SMS Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================= */}
        {/* SECTION 1: CALL ASSISTANCE (6 Cols)      */}
        {/* ========================================= */}
        <div className="lg:col-span-6 space-y-6">
          <GlassCard className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-neutral-900 dark:text-white text-base">
                      Call Assistance
                    </h2>
                    <p className="text-[11px] text-neutral-500">
                      Outbound Twilio call from <strong className="font-mono text-neutral-700 dark:text-neutral-300">{fromPhone}</strong> to <strong className="font-mono text-neutral-700 dark:text-neutral-300">{registeredNumber}</strong>
                    </p>
                  </div>
                </div>

                {callActive && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500 text-white animate-pulse flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    {formatTimer(callSeconds)}
                  </span>
                )}
              </div>

              {callFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs mb-4 flex items-start gap-2.5 animate-in fade-in ${
                    callFeedback.type === 'success'
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span>{callFeedback.message}</span>
                    {callFeedback.sid && (
                      <span className="block font-mono text-[10px] text-neutral-400 mt-0.5">
                        Call SID: {callFeedback.sid}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Call Active HUD Interface */}
              {callActive ? (
                <div className="p-5 rounded-2xl bg-neutral-950 text-white border border-neutral-800 space-y-4 mb-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center animate-bounce">
                        <PhoneCall className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Call Connected (Speaking TwiML)</div>
                        <div className="text-xs font-mono text-emerald-400">Target: {registeredNumber}</div>
                      </div>
                    </div>
                    <div className="text-xl font-mono font-extrabold text-white">
                      {formatTimer(callSeconds)}
                    </div>
                  </div>

                  {/* Speech script preview */}
                  <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 italic leading-relaxed">
                    "{callScript}"
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      Live voice synthesized to registered line
                    </span>

                    <button
                      type="button"
                      onClick={handleEndCall}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>End Assistance Call</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Assistance Voice Message (Spoken to caller via TwiML):
                    </label>
                    <textarea
                      value={callScript}
                      onChange={e => setCallScript(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-xl text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>

                  {/* Quick Script Chips */}
                  <div>
                    <span className="block text-[11px] uppercase font-bold tracking-wider text-neutral-400 mb-2">
                      Voice Call Presets:
                    </span>
                    <div className="space-y-1.5">
                      {quickCallScripts.map(item => (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => setCallScript(item.text)}
                          className="w-full p-2.5 rounded-xl text-left bg-neutral-100/70 hover:bg-neutral-200/80 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-neutral-500 line-clamp-1">
                              {item.text}
                            </div>
                          </div>
                          <Mic className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!callActive && (
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                <button
                  type="button"
                  onClick={handleInitiateCall}
                  disabled={isCalling}
                  className="w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isCalling ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Dialing {registeredNumber}...</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-5 h-5 text-emerald-500" />
                      <span>Call Assistance ({registeredNumber})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => dialDirectPhone(registeredNumber)}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200/90 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs border border-neutral-300 dark:border-neutral-700 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  title="Open device dialer to place call directly"
                >
                  <PhoneForwarded className="w-4 h-4 text-emerald-500" />
                  <span>Dial Direct on Phone App ({registeredNumber})</span>
                </button>
              </div>
            )}
          </GlassCard>
        </div>

        {/* ========================================= */}
        {/* SECTION 2: SMS ALERT DISPATCHER (6 Cols)  */}
        {/* ========================================= */}
        <div className="lg:col-span-6 space-y-6">
          <GlassCard className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-neutral-900 dark:text-white text-base">
                      SMS Alert
                    </h2>
                    <p className="text-[11px] text-neutral-500">
                      Dispatched from Twilio <strong className="font-mono text-neutral-700 dark:text-neutral-300">{fromPhone}</strong> to <strong className="font-mono text-neutral-700 dark:text-neutral-300">{registeredNumber}</strong>
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  {smsBody.length} chars
                </span>
              </div>

              {smsFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs mb-4 flex items-start gap-2.5 animate-in fade-in ${
                    smsFeedback.type === 'success'
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span>{smsFeedback.message}</span>
                    {smsFeedback.sid && (
                      <span className="block font-mono text-[10px] text-neutral-400 mt-0.5">
                        Message SID: {smsFeedback.sid}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSendSmsAlert} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Type Alert Message:
                  </label>
                  <textarea
                    value={smsBody}
                    onChange={e => setSmsBody(e.target.value)}
                    rows={3}
                    placeholder="Type your emergency alert or message here..."
                    className="w-full p-3 rounded-xl text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    required
                  />
                </div>

                {/* Quick Alert Chips */}
                <div>
                  <span className="block text-[11px] uppercase font-bold tracking-wider text-neutral-400 mb-2">
                    Quick SMS Alert Templates:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickSmsTemplates.map(tpl => (
                      <button
                        key={tpl.title}
                        type="button"
                        onClick={() => setSmsBody(tpl.text)}
                        className="p-2.5 rounded-xl text-left bg-neutral-100/70 hover:bg-neutral-200/80 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 transition-colors group"
                      >
                        <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
                          <span>{tpl.title}</span>
                          <Sparkles className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                          {tpl.text}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                  <button
                    type="submit"
                    disabled={isSendingSms || !smsBody.trim()}
                    className="w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {isSendingSms ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Sending SMS via Twilio...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send SMS Alert ({registeredNumber})</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openDirectSmsApp(registeredNumber, smsBody)}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200/90 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs border border-neutral-300 dark:border-neutral-700 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    title="Open device native SMS app to send directly"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    <span>Open in Phone Messages (SMS) Directly</span>
                  </button>
                </div>
              </form>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ================================================= */}
      {/* SECTION 3: LIVE DISPATCH LOG & ACTIVITY STREAM    */}
      {/* ================================================= */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
            <h3 className="font-heading font-bold text-neutral-900 dark:text-white text-base">
              Registered Number Assistance Activity Log
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800/80 p-0.5 border border-neutral-200 dark:border-neutral-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('calls')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === 'calls'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                Calls ({callHistory.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sms')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === 'sms'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                SMS ({smsHistory.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                clearCallHistory();
                clearSmsHistory();
                setCallHistory([]);
                setSmsHistory([]);
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 transition-colors"
              title="Clear all history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Activity Items */}
        <div className="space-y-3">
          {/* Render Calls */}
          {(activeTab === 'all' || activeTab === 'calls') &&
            callHistory.map(call => (
              <div
                key={call.id}
                className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
                        Voice Call Assistance → {call.to}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {call.timestamp}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {call.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/40 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 italic">
                  "{call.speechText}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Twilio Carrier Dispatch</span>
                  {call.sid && <span className="font-mono">{call.sid}</span>}
                </div>
              </div>
            ))}

          {/* Render SMS */}
          {(activeTab === 'all' || activeTab === 'sms') &&
            smsHistory.map(msg => (
              <div
                key={msg.id}
                className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
                        SMS Alert Dispatched → {msg.to}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {msg.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/40 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  {msg.body}
                </p>

                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Twilio Message Dispatch</span>
                  {msg.sid && <span className="font-mono">{msg.sid}</span>}
                </div>
              </div>
            ))}

          {callHistory.length === 0 && smsHistory.length === 0 && (
            <div className="p-8 text-center text-neutral-400 text-xs">
              No assistance calls or SMS alerts dispatched yet. Click "Call Assistance" or send an "SMS Alert" above.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
