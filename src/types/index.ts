export type UserRole = 'patient' | 'doctor';

export type Language = 'en' | 'kn' | 'hi';

export type NetworkQuality = 'good' | 'weak' | 'very_weak' | 'offline';

export type ConsultationChannel = 'video' | 'audio' | 'chat' | 'sms';

export type CaseStatus = 'draft' | 'pending_sync' | 'submitted' | 'in_review' | 'responded' | 'closed';

export type UrgencyLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  preferredLanguage: Language;
  preferredChannel: ConsultationChannel;
  avatarUrl?: string;
  bloodGroup: string;
  emergencyContact: string;
  location: string;
}

export interface CaseMessage {
  id: string;
  sender: 'patient' | 'doctor' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isSimulatedAi?: boolean;
}

export interface DemoVitals {
  bloodPressure: string;
  heartRate: number;
  spo2: number;
  temperature: string;
  lastUpdated: string;
  isFictionalSample: true;
}

export interface CaseRecord {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  title: string;
  reason: string;
  symptoms: string[];
  duration: string;
  notes?: string;
  language: Language;
  channel: ConsultationChannel;
  status: CaseStatus;
  urgency: UrgencyLevel;
  createdAt: string;
  updatedAt: string;
  vitalsDemo?: DemoVitals;
  messages: CaseMessage[];
  doctorNotes?: string;
  syncStatus: 'synced' | 'pending' | 'offline_draft';
}

export interface Consultation {
  id: string;
  caseId: string;
  title: string;
  doctorName: string;
  specialty: string;
  channel: ConsultationChannel;
  status: 'active' | 'waiting' | 'completed' | 'scheduled';
  scheduledFor: string;
  durationMinutes?: number;
  networkSummary?: string;
}

export interface FeedbackEntry {
  id: string;
  rating: number;
  category: 'Ease of Use' | 'Connectivity Experience' | 'Language Support' | 'Consultation Flow' | 'Other';
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
  userName?: string;
}

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  category: 'Case Updates' | 'Consultation' | 'Connection' | 'System';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: Language;
  reducedMotion: boolean;
  soundNotifications: boolean;
  offlineAutoSync: boolean;
  bandwidthSaverMode: boolean;
}

export interface NetworkSimulationState {
  quality: NetworkQuality;
  latencyMs: number;
  packetLoss: number;
  activeFallback: ConsultationChannel;
  isSyncing: boolean;
  lastSyncTimestamp?: string;
}
