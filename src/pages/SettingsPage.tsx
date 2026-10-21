import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { GlassCard } from '../components/common/GlassCard';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import {
  Settings,
  Moon,
  Sun,
  RefreshCcw
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetAll } = useDemo();

  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const toggleTheme = () => {
    updateSettings({
      theme: settings.theme === 'dark' ? 'light' : 'dark'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>System & Preferences</span>
        </div>
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
          Application Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure visual themes, offline sync protocols, and prototype simulation state.
        </p>
      </div>

      {/* Visual Theme Section */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
              Display & Appearance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select between light clinical glassmorphism and high-contrast dark mode.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white shadow-xs hover:border-cyan-400 transition-all"
          >
            {settings.theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-600" />
                <span>Switch to Dark Theme</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div
            onClick={() => updateSettings({ theme: 'light' })}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              settings.theme === 'light'
                ? 'border-cyan-500 bg-cyan-50/50 dark:bg-slate-800 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 opacity-70'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Clinical Icy</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Translucent frosted cards on icy cyan/mint background.
            </p>
          </div>

          <div
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              settings.theme === 'dark'
                ? 'border-cyan-500 bg-cyan-50/50 dark:bg-slate-800 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 opacity-70'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Moon className="w-4 h-4 text-cyan-400" />
              <span>Deep Navy Dark Mode</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Low glare for nighttime health center clinical shifts.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Network & Bandwidth Saver Options */}
      <GlassCard className="p-6 space-y-4">
        <div>
          <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
            Network & Offline Sync Rules
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control automated background retry behaviors and data savings.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Automatic Background Sync
              </span>
              <span className="text-[11px] text-slate-500 block">
                Automatically push queued offline cases when network status returns to Good or Weak.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.offlineAutoSync}
              onChange={e => updateSettings({ offlineAutoSync: e.target.checked })}
              className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Bandwidth Saver Mode
              </span>
              <span className="text-[11px] text-slate-500 block">
                Always default consultation media to low-bitrate OPUS audio even when 4G is detected.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.bandwidthSaverMode}
              onChange={e => updateSettings({ bandwidthSaverMode: e.target.checked })}
              className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
            />
          </label>
        </div>
      </GlassCard>

      {/* Reset Demo Prototype Data */}
      <GlassCard className="p-6 border-rose-200/80 dark:border-rose-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-bold text-rose-900 dark:text-rose-200 text-base">
              Prototype Demonstration Data
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Reset all local case notes, consultations, ratings, and return to default initial seeds.
            </p>
          </div>

          <button
            onClick={() => setIsConfirmingReset(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </GlassCard>

      {/* About DocTalk & Safety Disclaimer */}
      <GlassCard className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
            DT
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              DocTalk — Telemedicine That Never Drops
            </h4>
            <span className="text-[10px] text-slate-400">Release: v2.4.0 (Offline-First Edition)</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          DocTalk was engineered specifically for rural primary health centers (PHCs) and remote agricultural communities facing fluctuating 2G/3G connectivity. It implements tiered media graceful degradation (Video → HD Voice → Compressed Voice Notes → Local SQLite Offline Storage → 2G SMS callback).
        </p>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 leading-relaxed">
          <strong>Safety & Legal Disclaimer:</strong> This application is a technology demonstration prototype. All doctor responses, symptoms, triage recommendations, and vital numbers are synthetic demonstrations. It does not provide real medical diagnoses or prescribe medications. In an emergency, contact local ambulance services immediately.
        </div>
      </GlassCard>

      {/* Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isConfirmingReset}
        title="Reset All Demonstration Data?"
        message="This will restore all default seed cases, initial notifications, and patient profiles. Any custom cases or notes created in this browser session will be reset."
        confirmLabel="Reset Everything"
        isDestructive
        onConfirm={() => {
          resetAll();
          setIsConfirmingReset(false);
        }}
        onCancel={() => setIsConfirmingReset(false)}
      />
    </div>
  );
};
