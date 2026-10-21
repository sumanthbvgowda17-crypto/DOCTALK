import type {
  CaseRecord,
  Consultation,
  DemoNotification,
  DemoProfile,
  FeedbackEntry,
  AppSettings,
  NetworkQuality,
  UserRole
} from '../types';
import {
  INITIAL_CASES,
  INITIAL_CONSULTATIONS,
  INITIAL_FEEDBACK,
  INITIAL_NOTIFICATIONS,
  INITIAL_PATIENT_PROFILE,
  INITIAL_DOCTOR_PROFILE,
  INITIAL_SETTINGS
} from '../data/seedData';

const KEYS = {
  CASES: 'doctalk_demo_cases_v2',
  CONSULTATIONS: 'doctalk_demo_consultations_v2',
  FEEDBACK: 'doctalk_demo_feedback_v2',
  NOTIFICATIONS: 'doctalk_demo_notifications_v2',
  PATIENT_PROFILE: 'doctalk_demo_patient_profile_v2',
  DOCTOR_PROFILE: 'doctalk_demo_doctor_profile_v2',
  SETTINGS: 'doctalk_demo_settings_v2',
  ROLE: 'doctalk_demo_current_role_v2',
  NETWORK_QUALITY: 'doctalk_demo_network_quality_v2',
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[DocTalk Storage] Failed reading ${key}:`, err);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[DocTalk Storage] Failed writing ${key}:`, err);
  }
}

export const StorageService = {
  // Roles
  getCurrentRole(): UserRole {
    const saved = localStorage.getItem(KEYS.ROLE) as UserRole;
    return saved === 'doctor' ? 'doctor' : 'patient';
  },
  setCurrentRole(role: UserRole): void {
    localStorage.setItem(KEYS.ROLE, role);
  },

  // Network Quality
  getNetworkQuality(): NetworkQuality {
    const saved = localStorage.getItem(KEYS.NETWORK_QUALITY) as NetworkQuality;
    return saved || 'good';
  },
  setNetworkQuality(quality: NetworkQuality): void {
    localStorage.setItem(KEYS.NETWORK_QUALITY, quality);
  },

  // Patient Profile
  getPatientProfile(): DemoProfile {
    return safeGet<DemoProfile>(KEYS.PATIENT_PROFILE, INITIAL_PATIENT_PROFILE);
  },
  savePatientProfile(profile: DemoProfile): void {
    safeSet(KEYS.PATIENT_PROFILE, profile);
  },

  // Doctor Profile
  getDoctorProfile(): DemoProfile {
    return safeGet<DemoProfile>(KEYS.DOCTOR_PROFILE, INITIAL_DOCTOR_PROFILE);
  },
  saveDoctorProfile(profile: DemoProfile): void {
    safeSet(KEYS.DOCTOR_PROFILE, profile);
  },

  // Cases (Shared between patient and doctor!)
  getCases(): CaseRecord[] {
    return safeGet<CaseRecord[]>(KEYS.CASES, INITIAL_CASES);
  },
  saveCases(cases: CaseRecord[]): void {
    safeSet(KEYS.CASES, cases);
  },
  getCaseById(id: string): CaseRecord | undefined {
    const cases = this.getCases();
    return cases.find(c => c.id.toLowerCase() === id.toLowerCase());
  },
  addCase(newCase: CaseRecord): void {
    const cases = this.getCases();
    const updated = [newCase, ...cases];
    this.saveCases(updated);
  },
  updateCase(id: string, updater: (prev: CaseRecord) => CaseRecord): CaseRecord | undefined {
    const cases = this.getCases();
    const index = cases.findIndex(c => c.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return undefined;
    const updatedCase = updater(cases[index]);
    cases[index] = updatedCase;
    this.saveCases(cases);
    return updatedCase;
  },

  // Consultations
  getConsultations(): Consultation[] {
    return safeGet<Consultation[]>(KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
  },
  saveConsultations(list: Consultation[]): void {
    safeSet(KEYS.CONSULTATIONS, list);
  },
  addConsultation(c: Consultation): void {
    const list = this.getConsultations();
    this.saveConsultations([c, ...list]);
  },

  // Notifications
  getNotifications(): DemoNotification[] {
    return safeGet<DemoNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
  saveNotifications(list: DemoNotification[]): void {
    safeSet(KEYS.NOTIFICATIONS, list);
  },
  markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const updated = list.map(n => n.id === id ? { ...n, isRead: true } : n);
    this.saveNotifications(updated);
  },
  markAllNotificationsAsRead(): void {
    const list = this.getNotifications();
    this.saveNotifications(list.map(n => ({ ...n, isRead: true })));
  },
  clearNotifications(): void {
    this.saveNotifications([]);
  },
  addNotification(notif: Omit<DemoNotification, 'id' | 'timestamp' | 'isRead'>): void {
    const list = this.getNotifications();
    const newEntry: DemoNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false,
    };
    this.saveNotifications([newEntry, ...list]);
  },

  // Feedback
  getFeedback(): FeedbackEntry[] {
    return safeGet<FeedbackEntry[]>(KEYS.FEEDBACK, INITIAL_FEEDBACK);
  },
  saveFeedback(list: FeedbackEntry[]): void {
    safeSet(KEYS.FEEDBACK, list);
  },
  addFeedback(entry: FeedbackEntry): void {
    const list = this.getFeedback();
    this.saveFeedback([entry, ...list]);
  },
  deleteFeedback(id: string): void {
    const list = this.getFeedback();
    this.saveFeedback(list.filter(f => f.id !== id));
  },

  // Settings
  getSettings(): AppSettings {
    return safeGet<AppSettings>(KEYS.SETTINGS, INITIAL_SETTINGS);
  },
  saveSettings(settings: AppSettings): void {
    safeSet(KEYS.SETTINGS, settings);
  },

  // Reset demo data
  resetAllDemoData(): void {
    safeSet(KEYS.CASES, INITIAL_CASES);
    safeSet(KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
    safeSet(KEYS.FEEDBACK, INITIAL_FEEDBACK);
    safeSet(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    safeSet(KEYS.PATIENT_PROFILE, INITIAL_PATIENT_PROFILE);
    safeSet(KEYS.DOCTOR_PROFILE, INITIAL_DOCTOR_PROFILE);
    safeSet(KEYS.SETTINGS, INITIAL_SETTINGS);
    safeSet(KEYS.ROLE, 'patient');
    safeSet(KEYS.NETWORK_QUALITY, 'good');
  }
};
