import type { Medicine } from './index';

export type TimeLabel = 'morning' | 'afternoon' | 'evening' | 'night';

export type TimeOfDay = {
  label: TimeLabel;
  hour: number;
  minute: number;
};

export type Dosage = {
  amount: number;
  unit: string;
};

export type Frequency = {
  type: 'daily' | 'weekly';
  daysOfWeek?: number[];
};

export type Tracker = {
  _id: string;
  deviceId: string;
  medicineId: Medicine | string;
  medicineName?: string;
  dosage: Dosage;
  frequency: Frequency;
  timesOfDay: TimeOfDay[];
  tagColor: string;
  notes?: string;
  startDate: string;
  endDate?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type IntakeStatus = 'taken' | 'skipped' | 'missed' | null;

export type ScheduleItem = {
  trackerId: string;
  medicineId: string;
  medicineName: string;
  medicineForm?: string | null;
  dosage: Dosage;
  tagColor: string;
  timeLabel: TimeLabel;
  hour: number;
  minute: number;
  status: IntakeStatus;
  takenAt: string | null;
};

export type ScheduleResponse = {
  date: string;
  items: ScheduleItem[];
};

export type AdherenceResponse = {
  days: number;
  scheduled: number;
  taken: number;
  percent: number;
};

export const TIME_LABEL_DEFAULTS: Record<TimeLabel, { hour: number; minute: number }> = {
  morning: { hour: 8, minute: 0 },
  afternoon: { hour: 13, minute: 0 },
  evening: { hour: 18, minute: 0 },
  night: { hour: 21, minute: 0 },
};

export const formatTime = (hour: number, minute: number): string => {
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${h12}:${String(minute).padStart(2, '0')} ${ampm}`;
};

export const TAG_COLORS = ['#005FB8', '#D97706', '#06B6D4', '#94A3B8'];
