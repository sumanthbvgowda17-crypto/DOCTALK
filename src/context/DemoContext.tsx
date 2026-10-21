import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  UserRole,
  NetworkQuality,
  ConsultationChannel,
  DemoProfile,
  CaseRecord,
  Consultation,
  DemoNotification,
  FeedbackEntry,
  AppSettings
} from '../types';
import { StorageService } from '../lib/storage';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface DemoContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  networkQuality: NetworkQuality;
  setNetworkQuality: (quality: NetworkQuality) => void;
  activeFallbackChannel: ConsultationChannel;
  isSyncing: boolean;
  simulateSync: () => Promise<void>;
  pendingSyncCount: number;
  profile: DemoProfile;
  patientProfile: DemoProfile;
  doctorProfile: DemoProfile;
  updateProfile: (profile: DemoProfile) => void;
  cases: CaseRecord[];
  addCase: (newCase: CaseRecord) => void;
  updateCase: (id: string, updater: (prev: CaseRecord) => CaseRecord) => void;
  consultations: Consultation[];
  addConsultation: (c: Consultation) => void;
  notifications: DemoNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  feedback: FeedbackEntry[];
  addFeedback: (entry: FeedbackEntry) => void;
  deleteFeedback: (id: string) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetAll: () => void;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const fallbackChannelForQuality = (quality: NetworkQuality): ConsultationChannel => {
  switch (quality) {
    case 'good':
      return 'video';
    case 'weak':
      return 'audio';
    case 'very_weak':
      return 'chat';
    case 'offline':
      return 'sms';
    default:
      return 'video';
  }
};

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(StorageService.getCurrentRole());
  const [networkQuality, setNetworkQualityState] = useState<NetworkQuality>(StorageService.getNetworkQuality());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [patientProfile, setPatientProfileState] = useState<DemoProfile>(StorageService.getPatientProfile());
  const [doctorProfile, setDoctorProfileState] = useState<DemoProfile>(StorageService.getDoctorProfile());
  const [cases, setCasesState] = useState<CaseRecord[]>(StorageService.getCases());
  const [consultations, setConsultationsState] = useState<Consultation[]>(StorageService.getConsultations());
  const [notifications, setNotificationsState] = useState<DemoNotification[]>(StorageService.getNotifications());
  const [feedback, setFeedbackState] = useState<FeedbackEntry[]>(StorageService.getFeedback());
  const [settings, setSettingsState] = useState<AppSettings>(StorageService.getSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { user, profile: authProfile } = useAuth();

  // Sync authenticated user into local profile state
  useEffect(() => {
    if (user) {
      const email = user.email || '';
      const name = authProfile?.full_name || email.split('@')[0];
      if (authProfile?.role === 'doctor') {
        setDoctorProfileState(prev => ({
          ...prev,
          name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
          email
        }));
      } else {
        setPatientProfileState(prev => ({
          ...prev,
          name,
          email
        }));
      }
    }
  }, [user, authProfile]);

  // Apply dark mode class to root html element based on settings
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Toast dispatch
  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    StorageService.setCurrentRole(newRole);
    showToast({
      type: 'info',
      title: `Switched to ${newRole === 'doctor' ? 'Doctor Demo' : 'Patient Demo'}`,
      message: 'Workspace view and actions have been re-calibrated.'
    });
  };

  const setNetworkQuality = (newQuality: NetworkQuality) => {
    setNetworkQualityState(newQuality);
    StorageService.setNetworkQuality(newQuality);
    const fallback = fallbackChannelForQuality(newQuality);
    const labels: Record<NetworkQuality, string> = {
      good: 'Good (4G/WiFi - Video Mode Active)',
      weak: 'Weak (3G - Seamless Fallback to HD Audio)',
      very_weak: 'Very Weak (2G/Edge - Chat & Voice Notes Mode)',
      offline: 'Offline (No Signal - Queued Locally in Storage)'
    };
    showToast({
      type: newQuality === 'offline' ? 'warning' : 'info',
      title: `Network: ${labels[newQuality]}`,
      message: `Active channel adjusted to: ${fallback.toUpperCase()}`
    });
  };

  const activeFallbackChannel = fallbackChannelForQuality(networkQuality);

  const pendingSyncCount = cases.filter(c => c.syncStatus !== 'synced').length;

  const simulateSync = async () => {
    if (networkQuality === 'offline') {
      showToast({
        type: 'warning',
        title: 'Network is Offline',
        message: 'Cannot synchronize while in offline mode. Switch network status to Weak or Good first.'
      });
      return;
    }

    setIsSyncing(true);
    showToast({
      type: 'info',
      title: 'Syncing Offline Queue...',
      message: 'Transmitting queued case payloads over simulated connection.'
    });

    await new Promise(res => setTimeout(res, 1800));

    const updated = cases.map(c => {
      if (c.syncStatus !== 'synced') {
        return {
          ...c,
          syncStatus: 'synced' as const,
          status: c.status === 'draft' ? ('submitted' as const) : c.status,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    setCasesState(updated);
    StorageService.saveCases(updated);
    setIsSyncing(false);

    StorageService.addNotification({
      title: 'Sync Completed Successfully',
      message: 'All pending local case drafts were transmitted and confirmed by Central Triage Hub.',
      category: 'Connection',
      link: '/cases'
    });
    setNotificationsState(StorageService.getNotifications());

    showToast({
      type: 'success',
      title: 'All Cases Synchronized',
      message: 'Pending items synced with Doctor Triage Queue.'
    });
  };

  const profile = role === 'doctor' ? doctorProfile : patientProfile;

  const updateProfile = (newProfile: DemoProfile) => {
    if (role === 'doctor') {
      setDoctorProfileState(newProfile);
      StorageService.saveDoctorProfile(newProfile);
    } else {
      setPatientProfileState(newProfile);
      StorageService.savePatientProfile(newProfile);
    }
    showToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Demo preferences saved locally in browser.'
    });
  };

  const addCase = (newCase: CaseRecord) => {
    StorageService.addCase(newCase);
    setCasesState(StorageService.getCases());

    // Also add to consultations if not draft
    if (newCase.status !== 'draft') {
      const newConsultation: Consultation = {
        id: `CNS-${Math.floor(100 + Math.random() * 900)}`,
        caseId: newCase.id,
        title: newCase.title,
        doctorName: 'Dr. Anita Rao',
        specialty: 'Central Tele-Triage',
        channel: newCase.channel,
        status: newCase.syncStatus === 'synced' ? 'active' : 'waiting',
        scheduledFor: 'Immediate Triage Queue',
        networkSummary: `Adaptive ${newCase.channel.toUpperCase()} session`
      };
      StorageService.addConsultation(newConsultation);
      setConsultationsState(StorageService.getConsultations());
    }

    StorageService.addNotification({
      title: `Case ${newCase.id} Created`,
      message: `Intake registered for ${newCase.reason} (${newCase.channel.toUpperCase()}).`,
      category: 'Case Updates',
      link: `/cases/${newCase.id}`
    });
    setNotificationsState(StorageService.getNotifications());

    showToast({
      type: 'success',
      title: `Case ${newCase.id} Saved`,
      message: newCase.syncStatus === 'synced' ? 'Forwarded to doctor queue' : 'Stored locally for sync'
    });
  };

  const updateCase = (id: string, updater: (prev: CaseRecord) => CaseRecord) => {
    const updated = StorageService.updateCase(id, updater);
    if (updated) {
      setCasesState(StorageService.getCases());
    }
  };

  const addConsultation = (c: Consultation) => {
    StorageService.addConsultation(c);
    setConsultationsState(StorageService.getConsultations());
  };

  const markNotificationAsRead = (id: string) => {
    StorageService.markNotificationAsRead(id);
    setNotificationsState(StorageService.getNotifications());
  };

  const markAllNotificationsAsRead = () => {
    StorageService.markAllNotificationsAsRead();
    setNotificationsState(StorageService.getNotifications());
    showToast({ type: 'info', title: 'Notifications', message: 'All marked as read.' });
  };

  const clearNotifications = () => {
    StorageService.clearNotifications();
    setNotificationsState([]);
    showToast({ type: 'info', title: 'Notifications Cleared' });
  };

  const addFeedback = (entry: FeedbackEntry) => {
    StorageService.addFeedback(entry);
    setFeedbackState(StorageService.getFeedback());
    showToast({
      type: 'success',
      title: 'Feedback Received',
      message: 'Thank you for helping improve DocTalk resilience.'
    });
  };

  const deleteFeedback = (id: string) => {
    StorageService.deleteFeedback(id);
    setFeedbackState(StorageService.getFeedback());
    showToast({ type: 'info', title: 'Feedback Entry Removed' });
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettingsState(merged);
    StorageService.saveSettings(merged);
    showToast({ type: 'success', title: 'Settings Saved', message: 'Updated preferences applied.' });
  };

  const resetAll = () => {
    StorageService.resetAllDemoData();
    setRoleState('patient');
    setNetworkQualityState('good');
    setPatientProfileState(StorageService.getPatientProfile());
    setDoctorProfileState(StorageService.getDoctorProfile());
    setCasesState(StorageService.getCases());
    setConsultationsState(StorageService.getConsultations());
    setNotificationsState(StorageService.getNotifications());
    setFeedbackState(StorageService.getFeedback());
    setSettingsState(StorageService.getSettings());
    showToast({
      type: 'info',
      title: 'Demo Reset Completed',
      message: 'Fresh fictional seed records loaded.'
    });
  };

  return (
    <DemoContext.Provider
      value={{
        role,
        setRole,
        networkQuality,
        setNetworkQuality,
        activeFallbackChannel,
        isSyncing,
        simulateSync,
        pendingSyncCount,
        profile,
        patientProfile,
        doctorProfile,
        updateProfile,
        cases,
        addCase,
        updateCase,
        consultations,
        addConsultation,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        feedback,
        addFeedback,
        deleteFeedback,
        settings,
        updateSettings,
        resetAll,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
