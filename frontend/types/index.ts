export type Variant = {
  form: string;
  code: string | null;
  size: string;
  tp: string | null;
  mrp: string | null;
};

export type Product = {
  brand: string;
  manufacturer: string;
  variants: Variant[];
};

export type Medicine = {
  _id: string;
  drug_name: string;
  category?: string;
  content?: string;
  forms: string[];
  indications: string[];
  dosage: Record<string, string>;
  contraindications: string[];
  precautions: string[];
  interactions: string[];
  side_effects: string[];
  administration: string | null;
  stability: string | null;
  pregnancy: string | null;
  lactation: string | null;
  products: Product[];
  _processed_at?: string;
  _source?: string;
};

export type SearchResponse = {
  best: Medicine | null;
  alternates: Medicine[];
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
