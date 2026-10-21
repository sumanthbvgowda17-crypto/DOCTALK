import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { GlassCard } from '../components/common/GlassCard';
import {
  User,
  Save,
  RotateCcw
} from 'lucide-react';
import type { ConsultationChannel, Language } from '../types';

export const AccountPage: React.FC = () => {
  const { profile, updateProfile, role, settings, updateSettings } = useDemo();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [location, setLocation] = useState(profile.location);
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup);
  const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContact);
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(profile.preferredLanguage);
  const [preferredChannel, setPreferredChannel] = useState<ConsultationChannel>(profile.preferredChannel);

  // Accessibility & System Preferences
  const [reducedMotion, setReducedMotion] = useState(settings.reducedMotion);
  const [soundNotifications, setSoundNotifications] = useState(settings.soundNotifications);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...profile,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      age: Number(age) || profile.age,
      gender,
      location: location.trim(),
      bloodGroup,
      emergencyContact: emergencyContact.trim(),
      preferredLanguage,
      preferredChannel
    });

    updateSettings({
      reducedMotion,
      soundNotifications,
      language: preferredLanguage
    });
  };

  const handleResetProfile = () => {
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setAge(profile.age);
    setGender(profile.gender);
    setLocation(profile.location);
    setBloodGroup(profile.bloodGroup);
    setEmergencyContact(profile.emergencyContact);
    setPreferredLanguage(profile.preferredLanguage);
    setPreferredChannel(profile.preferredChannel);
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .filter(p => !p.startsWith('Dr.'))
      .slice(0, 2)
      .map(p => p[0])
      .join('')
      .toUpperCase() || 'DT';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
          <User className="w-4 h-4" />
          <span>Account Identity</span>
        </div>
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
          Account Profile & Regional Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your profile, vernacular language preferences, and bandwidth defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card with Avatar */}
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-cyan-600/20">
              {getInitials(name)}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                {name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {email} • Role: {role === 'doctor' ? 'Doctor Demo' : 'Patient Demo'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200">
                  Dialect: {preferredLanguage.toUpperCase()}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200">
                  Channel: {preferredChannel.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Name (Demo):
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Demo Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone Number:
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Region / District Location:
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age:
              </label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender:
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Blood Group (Demo Record):
              </label>
              <input
                type="text"
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Contact Number:
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </GlassCard>

        {/* Regional & Communication Preferences */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
            Language & Channel Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred Regional Language:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'kn', name: 'ಕನ್ನಡ' },
                  { code: 'hi', name: 'हिन्दी' },
                  { code: 'en', name: 'English' },
                ].map(l => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setPreferredLanguage(l.code as Language)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      preferredLanguage === l.code
                        ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred Consultation Channel:
              </label>
              <select
                value={preferredChannel}
                onChange={e => setPreferredChannel(e.target.value as ConsultationChannel)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="audio">Audio Only (Optimized for weak rural signal)</option>
                <option value="video">High Definition Video (4G / WiFi)</option>
                <option value="chat">Voice Notes & Text Triage (2G)</option>
                <option value="sms">SMS / Voice Call-back (Zero signal queue)</option>
              </select>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={e => setReducedMotion(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Reduced Motion Mode (Minimizes transitions for slower rural hardware)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={soundNotifications}
                onChange={e => setSoundNotifications(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Audible Chimes when Doctor reply is received
              </span>
            </label>
          </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetProfile}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Discard Changes</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
