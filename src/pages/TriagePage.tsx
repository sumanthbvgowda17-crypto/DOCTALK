import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import {
  Bot,
  RotateCcw,
  CheckCircle2,
  PhoneCall,
  ArrowRight
} from 'lucide-react';
import type { CaseRecord, Language } from '../types';

export const TriagePage: React.FC = () => {
  const { profile, addCase, networkQuality } = useDemo();
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language>('kn');
  const [step, setStep] = useState<number>(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [extraNotes, setExtraNotes] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [generatedCaseId, setGeneratedCaseId] = useState<string>('');

  // Localized strings
  const strings = {
    kn: {
      botGreeting: 'ನಮಸ್ಕಾರ! ನಾನು ಡಾಕ್‌ಟಾಕ್ ಪ್ರಾಥಮಿಕ ಲಕ್ಷಣ ಪರಿಶೀಲನಾ ಸಹಾಯಕ. (Hello! I am the DocTalk Symptom Triage Assistant). ನಿಮಗೆ ಯಾವ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಕಾಡುತ್ತಿದೆ?',
      emergencyNotice: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ: ತೀವ್ರ ಎದೆನೋವು ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆ ಇದ್ದಲ್ಲಿ ತಕ್ಷಣ 108/112 ಗೆ ಕರೆ ಮಾಡಿ.',
      step1Prompt: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮುಖ್ಯ ಸಮಸ್ಯೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:',
      step2Prompt: 'ಈ ಲಕ್ಷಣಗಳು ಎಷ್ಟು ದಿನಗಳಿಂದ ಇವೆ?',
      step3Prompt: 'ತಾಪಮಾನ ಅಥವಾ ಜ್ವರವಿದೆಯೇ? (ಐಚ್ಛಿಕ)',
      step4Prompt: 'ಇನ್ನೇನಾದರೂ ವಿವರಗಳನ್ನು ಸೇರಿಸಲು ಬಯಸುವಿರಾ?',
      summaryPrompt: 'ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ. ವೈದ್ಯರ ಪರಿಶೀಲನೆಗಾಗಿ ಕಳುಹಿಸುವುದೇ?',
      disclaimer: 'ಗಮನಿಸಿ: ಈ ಪರಿಶೀಲನೆಯು ಕೇವಲ ಪ್ರಾತ್ಯಕ್ಷಿಕೆಯಾಗಿದ್ದು, ನಿಜವಾದ ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ.',
      optionsCategory: ['ಜ್ವರ ಮತ್ತು ಕೆಮ್ಮು (Fever/Cough)', 'ಚರ್ಮದ ದದ್ದು / ಅಲರ್ಜಿ (Rash)', 'ಹೊಟ್ಟೆ ನೋವು (Stomach Ache)', 'ತಲೆನೋವು / ರಕ್ತದೊತ್ತಡ (BP/Headache)'],
      optionsDuration: ['1-2 ದಿನಗಳು (1-2 days)', '3-5 ದಿನಗಳು (3-5 days)', 'ಒಂದು ವಾರಕ್ಕೂ ಹೆಚ್ಚು (> 1 week)'],
      submitCase: 'ಕೇಸ್ ದಾಖಲಿಸಿ (Submit Case)'
    },
    hi: {
      botGreeting: 'नमस्ते! मैं डॉकटॉक लक्षण जांच सहायक हूँ। (Hello! I am DocTalk Symptom Triage Assistant). आप आज कैसा महसूस कर रहे हैं?',
      emergencyNotice: 'आपातकालीन सूचना: गंभीर सीने में दर्द या सांस लेने में तकलीफ होने पर तुरंत 108/112 पर संपर्क करें।',
      step1Prompt: 'कृपया अपनी मुख्य समस्या का चयन करें:',
      step2Prompt: 'ये लक्षण कितने दिनों से महसूस हो रहे हैं?',
      step3Prompt: 'क्या आपको बुखार या शरीर में तापमान लग रहा है? (वैकल्पिक)',
      step4Prompt: 'क्या कोई अतिरिक्त जानकारी जोड़ना चाहते हैं?',
      summaryPrompt: 'धन्यवाद। आपकी जानकारी सुरक्षित कर ली गई है। क्या इसे डॉक्टर के पास भेजना है?',
      disclaimer: 'सूचना: यह केवल एक प्रदर्शन प्रणाली है और वास्तविक चिकित्सा निदान नहीं है।',
      optionsCategory: ['बुखार और खांसी (Fever/Cough)', 'त्वचा पर चकत्ते / खुजली (Skin Rash)', 'पेट में दर्द (Stomach Pain)', 'सिरदर्द / बीपी जांच (Headache/BP)'],
      optionsDuration: ['1-2 दिन (1-2 days)', '3-5 दिन (3-5 days)', '1 सप्ताह से अधिक (>1 week)'],
      submitCase: 'केस दर्ज करें (Submit Case)'
    },
    en: {
      botGreeting: 'Hello! I am the DocTalk Guided Triage Assistant. What brings you in today?',
      emergencyNotice: 'Emergency Notice: If experiencing chest pain, severe breathlessness, or collapse, call 108 / 112 immediately.',
      step1Prompt: 'Please select your primary symptom category:',
      step2Prompt: 'How long have you had these symptoms?',
      step3Prompt: 'Do you have fever or an elevated temperature? (Optional)',
      step4Prompt: 'Any additional notes or existing medications?',
      summaryPrompt: 'Intake completed. Review summary below and submit to Central Tele-Triage Hub:',
      disclaimer: 'Safety notice: This automated triage uses rule-based templates for simulation only. No external AI or diagnosis is applied.',
      optionsCategory: ['Fever & Cough', 'Skin Rash & Itching', 'Digestive / Stomach Discomfort', 'Headache & Blood Pressure Review'],
      optionsDuration: ['1-2 days', '3-5 days', 'More than 1 week'],
      submitCase: 'Submit Case to Triage Desk'
    }
  };

  const t = strings[language];

  const handleSelectCategory = (cat: string) => {
    setSymptoms([cat]);
    setStep(1);
  };

  const handleSelectDuration = (dur: string) => {
    setDuration(dur);
    setStep(2);
  };

  const handleTemperatureSubmit = (temp: string) => {
    setTemperature(temp);
    setStep(3);
  };

  const handleFinishTriage = () => {
    const caseId = `DOC-${Math.floor(3000 + Math.random() * 6900)}`;
    setGeneratedCaseId(caseId);

    const isOffline = networkQuality === 'offline';

    const newCase: CaseRecord = {
      id: caseId,
      patientName: profile.name,
      patientAge: profile.age,
      patientGender: profile.gender,
      title: `Triage: ${symptoms[0] || 'Health Intake'}`,
      reason: symptoms[0] || 'General Intake',
      symptoms,
      duration: duration || '3-5 days',
      notes: extraNotes ? `${extraNotes} (Temp: ${temperature || 'Normal'})` : `Triage recorded via Vernacular Bot. Temp: ${temperature || 'Normal'}`,
      language,
      channel: 'audio',
      status: isOffline ? 'pending_sync' : 'submitted',
      urgency: symptoms[0]?.toLowerCase().includes('fever') ? 'moderate' : 'low',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: isOffline ? 'pending' : 'synced',
      vitalsDemo: {
        bloodPressure: '120/80 mmHg',
        heartRate: 75,
        spo2: 98,
        temperature: temperature || '98.6 °F',
        lastUpdated: 'Triage Intake',
        isFictionalSample: true
      },
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'system',
          senderName: 'DocTalk Vernacular Triage Engine',
          text: `Intake registered in ${language.toUpperCase()}. Reported: ${symptoms.join(', ')} for ${duration}.`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    addCase(newCase);
    setIsCompleted(true);
  };

  const handleRestart = () => {
    setStep(0);
    setSymptoms([]);
    setDuration('');
    setTemperature('');
    setExtraNotes('');
    setIsCompleted(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>Interactive Intake Engine</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Vernacular Symptom Triage
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Designed for non-literate and regional dialect users in rural healthcare centers.
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {(['kn', 'hi', 'en'] as const).map(l => (
            <button
              key={l}
              onClick={() => {
                setLanguage(l);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === l
                  ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {l === 'kn' ? 'ಕನ್ನಡ' : l === 'hi' ? 'हिन्दी' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Prominent Emergency Warning Notice */}
      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3 shadow-xs">
        <PhoneCall className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
          <strong>{t.emergencyNotice}</strong>
          <span className="block text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
            Do not wait for chatbot triage if you or a patient have severe breathing problems, sudden weakness, or chest trauma.
          </span>
        </div>
      </div>

      {/* Main Chatbot Interface Window */}
      <GlassCard className="p-6 flex flex-col min-h-[480px] justify-between border-cyan-200/80 dark:border-cyan-800/60 shadow-lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              DocTalk Triage Bot (Rule-based)
            </span>
          </div>
          <button
            onClick={handleRestart}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>

        {/* Chat message dialog scroll */}
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Bot Initial Greeting */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900 text-xs text-slate-800 dark:text-slate-100 max-w-lg leading-relaxed shadow-xs">
              {t.botGreeting}
            </div>
          </div>

          {/* Step 0: Symptom Selection Question */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900 text-xs text-slate-800 dark:text-slate-100 max-w-lg leading-relaxed">
              <p className="font-bold mb-2">{t.step1Prompt}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {t.optionsCategory.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleSelectCategory(opt)}
                    className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                      symptoms.includes(opt)
                        ? 'bg-cyan-600 text-white border-cyan-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User answered Step 0 */}
          {symptoms.length > 0 && (
            <div className="flex justify-end">
              <div className="p-3 rounded-2xl bg-teal-600 text-white text-xs font-medium max-w-md shadow-xs">
                {symptoms.join(', ')}
              </div>
            </div>
          )}

          {/* Step 1: Duration Question */}
          {step >= 1 && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900 text-xs text-slate-800 dark:text-slate-100 max-w-lg leading-relaxed">
                <p className="font-bold mb-2">{t.step2Prompt}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {t.optionsDuration.map(dur => (
                    <button
                      key={dur}
                      onClick={() => handleSelectDuration(dur)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        duration === dur
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* User answered Step 1 */}
          {duration && (
            <div className="flex justify-end">
              <div className="p-3 rounded-2xl bg-teal-600 text-white text-xs font-medium max-w-md shadow-xs">
                {duration}
              </div>
            </div>
          )}

          {/* Step 2: Temperature Question */}
          {step >= 2 && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900 text-xs text-slate-800 dark:text-slate-100 max-w-lg leading-relaxed space-y-2">
                <p className="font-bold">{t.step3Prompt}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTemperatureSubmit('98.6 °F (Normal)')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs"
                  >
                    No Fever
                  </button>
                  <button
                    onClick={() => handleTemperatureSubmit('100.4 °F (Mild)')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs"
                  >
                    Mild (~100°F)
                  </button>
                  <button
                    onClick={() => handleTemperatureSubmit('102.2 °F (High)')}
                    className="px-3 py-1.5 rounded-lg border bg-rose-50 text-rose-700 border-rose-200 font-semibold text-xs"
                  >
                    High Fever (&gt;102°F)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User answered Temperature */}
          {temperature && (
            <div className="flex justify-end">
              <div className="p-3 rounded-2xl bg-teal-600 text-white text-xs font-medium max-w-md shadow-xs">
                {temperature}
              </div>
            </div>
          )}

          {/* Step 3: Notes & Final Submission prompt */}
          {step >= 3 && !isCompleted && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900 text-xs text-slate-800 dark:text-slate-100 max-w-lg leading-relaxed space-y-3">
                <p className="font-bold">{t.step4Prompt}</p>
                <textarea
                  rows={2}
                  value={extraNotes}
                  onChange={e => setExtraNotes(e.target.value)}
                  placeholder="e.g. Taking herbal tea, working in fields..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleFinishTriage}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition-all"
                >
                  {t.submitCase}
                </button>
              </div>
            </div>
          )}

          {/* Triage Completed Card */}
          {isCompleted && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Triage Intake Dossier Created: {generatedCaseId}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your symptom record has been queued for Dr. Anita Rao at the Bangalore Central Tele-Triage Hub.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => navigate(`/cases/${generatedCaseId}`)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
                >
                  <span>Open Case Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRestart}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Start Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Safety Disclaimer Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          {t.disclaimer}
        </div>
      </GlassCard>
    </div>
  );
};
