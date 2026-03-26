export type Medicine = {
  id: string;
  medicineName: string;
  manufacturer: string;
  activeIngredient: string;
  strength: string;
  pros: string[];
  cons: string[];
  details: string;
  ingredients: string[];
  dosage: string;
  usage: string;
  warnings: string[];
  category: string;
  uses: string[];
  sideEffects: string[];
  isAuthentic: boolean;
};

export type HistoryItem = {
  id: string;
  medicineName: string;
  strength: string;
  type: 'scanned' | 'searched';
  date: string;
  image?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type QuickAction = {
  id: string;
  title: string;
  icon: string;
  route: string;
};

export type HealthTip = {
  id: string;
  text: string;
  icon: string;
};
