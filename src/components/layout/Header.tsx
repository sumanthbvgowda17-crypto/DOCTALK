import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
import { ConnectionStatusWidget } from './ConnectionStatusWidget';
import { RoleSwitcher } from './RoleSwitcher';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileMenu } from './ProfileMenu';
import { ThemeToggle } from '../common/ThemeToggle';
import { BrandLogo } from '../common/BrandLogo';
import { PhoneCall } from 'lucide-react';

const titleMap: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Patient Health Desk',
    subtitle: 'Adaptive tele-consultations, triage status, and local health profile'
  },
  '/consultations': {
    title: 'Consultations',
    subtitle: 'Active, scheduled, and past telemedicine sessions with network resilience'
  },
  '/consultations/new': {
    title: 'Start New Consultation',
    subtitle: 'Multi-lingual clinical intake with fallback support'
  },
  '/cases': {
    title: 'Case Management',
    subtitle: 'Unified offline-capable health records and doctor reviews'
  },
  '/triage': {
    title: 'Symptom Triage Assistant',
    subtitle: 'Guided clinical intake in Kannada, Hindi & English'
  },
  '/connection': {
    title: 'Resilience & Fallback Simulator',
    subtitle: 'Test how DocTalk adapts through Good, Weak, 2G, and Offline states'
  },
  '/assistance': {
    title: 'Twilio Assistance Dashboard',
    subtitle: 'Direct Twilio Voice (+17372508034) & SMS delivery to registered number (+91 9180420603)'
  },
  '/communications': {
    title: 'Communications & Twilio SMS Hub',
    subtitle: 'Dispatched SMS alerts, voice IVR callback order, and carrier status'
  },
  '/doctor': {
    title: 'Doctor Clinical Workspace',
    subtitle: 'Central Tele-Triage Hub review desk and queue management'
  },
  '/doctor/queue': {
    title: 'Triage Case Queue',
    subtitle: 'Prioritized incoming cases awaiting clinical reply'
  },
  '/analytics': {
    title: 'Operational Analytics',
    subtitle: 'Zero-drop performance, channel distribution, and response telemetry'
  },
  '/feedback': {
    title: 'Feedback & Reliability Hub',
    subtitle: 'Patient and health-worker ratings and continuous experience metrics'
  },
  '/notifications': {
    title: 'Notification Centre',
    subtitle: 'Clinical replies, network alerts, and offline sync logs'
  },
  '/account': {
    title: 'Account & Clinical Profile',
    subtitle: 'Personal profile, language options, and regional settings'
  },
  '/settings': {
    title: 'Application Settings',
    subtitle: 'Appearance, network bandwidth options, and application preferences'
  }
};

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getPageInfo = () => {
    if (location.pathname.startsWith('/cases/')) {
      return {
        title: 'Case Record Details',
        subtitle: 'Complete intake telemetry, vitals, and clinical dialogue'
      };
    }
    return titleMap[location.pathname] || {
      title: 'DocTalk Telemedicine',
      subtitle: 'Care continues, even when the network does not'
    };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-30 bg-white/75 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Titles & Breadcrumb */}
          <div className="flex-1 min-w-0">
            <div className="hidden sm:block">
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-2">
              <div className="lg:hidden w-8 h-8 rounded-lg bg-slate-100/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0">
                <BrandLogo variant="icon" size="xs" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-white tracking-tight truncate">
                {pageInfo.title}
              </h1>
            </div>
            <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {pageInfo.subtitle}
            </p>
          </div>

          {/* Right: Network indicator, Assistance quick button, Role switch, Notifs, Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/assistance')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold shadow-xs hover:scale-105 transition-all cursor-pointer"
              title="Open Twilio Call Assistance & SMS Alert Desk"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">Assistance</span>
            </button>

            <ConnectionStatusWidget />

            <div className="hidden sm:block">
              <RoleSwitcher compact />
            </div>

            <NotificationDropdown />

            <ThemeToggle />

            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
