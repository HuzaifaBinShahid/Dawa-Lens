import { HistoryItem, HealthTip } from '@/types';

export const historyItems: HistoryItem[] = [
  {
    id: '1',
    medicineName: 'Paracetamol',
    strength: '500mg',
    type: 'scanned',
    date: 'Oct 24, 2023',
  },
  {
    id: '2',
    medicineName: 'Amoxicillin',
    strength: '500mg',
    type: 'searched',
    date: 'Oct 20, 2023',
  },
  {
    id: '3',
    medicineName: 'Ibuprofen Syrup',
    strength: '100mg/5ml',
    type: 'scanned',
    date: 'Oct 18, 2023',
  },
];

export const healthTips: HealthTip[] = [
  {
    id: '1',
    text: 'Always take your medicine with a full glass of water for better absorption.',
    icon: 'water',
  },
  {
    id: '2',
    text: 'Never share your prescription medicines with others.',
    icon: 'alert-circle',
  },
  {
    id: '3',
    text: 'Store medicines in a cool, dry place away from direct sunlight.',
    icon: 'sunny',
  },
];
