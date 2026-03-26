import { Medicine, HistoryItem, HealthTip } from '@/types';

export const medicines: Medicine[] = [
  {
    id: '1',
    medicineName: 'Panadol',
    manufacturer: 'GlaxoSmithKline (GSK)',
    activeIngredient: 'Paracetamol',
    strength: '500mg',
    pros: [
      'Widely available in Pakistan',
      'Effective for mild to moderate pain and fever',
      'Generally well tolerated',
      'Suitable for most age groups',
    ],
    cons: [
      'Overuse can cause liver damage',
      'Not suitable for severe pain',
      'May mask symptoms of serious conditions',
    ],
    details:
      'Panadol (paracetamol) is one of the most commonly used pain and fever relievers in Pakistan. It is manufactured by GSK and available over the counter at pharmacies nationwide.',
    ingredients: ['Paracetamol (Acetaminophen)'],
    dosage:
      'Adults: 500mg-1g every 4-6 hours, max 4g/day. Children: 10-15mg/kg per dose.',
    usage:
      'Take with or after food. Swallow tablet with water. Do not exceed recommended dose.',
    warnings: [
      'Do not use with other paracetamol-containing products',
      'Avoid alcohol during use',
      'Consult doctor if pregnant or breastfeeding',
      'Seek help if overdose suspected',
    ],
    category: 'Pain Relief & Fever',
    uses: [
      'Relief of mild to moderate pain (headache, toothache)',
      'Reduction of fever',
      'Relief of muscular and joint pain',
    ],
    sideEffects: [
      'Nausea or stomach upset',
      'Loss of appetite',
      'Skin rash (rare)',
    ],
    isAuthentic: true,
  },
  {
    id: '2',
    medicineName: 'Brufen',
    manufacturer: 'Abbott Laboratories',
    activeIngredient: 'Ibuprofen',
    strength: '400mg',
    pros: [
      'Reduces pain and inflammation',
      'Commonly prescribed in Pakistan',
      'Effective for joint and muscle pain',
    ],
    cons: [
      'Can cause stomach upset or ulcers',
      'Not suitable for asthma patients in some cases',
      'May increase bleeding risk',
    ],
    details:
      'Brufen (ibuprofen) is a popular NSAID used across Pakistan for pain, fever, and inflammation.',
    ingredients: ['Ibuprofen'],
    dosage: 'Adults: 200-400mg every 4-6 hours, max 1200mg/day.',
    usage: 'Take with food or milk to reduce stomach irritation.',
    warnings: [
      'Do not use if you have stomach ulcers or bleeding',
      'Caution in heart/kidney disease',
      'Avoid in late pregnancy',
    ],
    category: 'Pain Relief & Anti-inflammatory',
    uses: [
      'Headaches and dental pain',
      'Menstrual pain',
      'Muscle aches and fever',
    ],
    sideEffects: [
      'Stomach pain or heartburn',
      'Dizziness',
      'Nausea',
    ],
    isAuthentic: true,
  },
  {
    id: '3',
    medicineName: 'Amoxicillin',
    manufacturer: 'Various',
    activeIngredient: 'Amoxicillin',
    strength: '500mg',
    pros: [
      'Broad-spectrum antibiotic',
      'Well tolerated',
      'Available in capsule and syrup forms',
    ],
    cons: [
      'Can cause allergic reactions',
      'May cause diarrhoea',
      'Overuse leads to resistance',
    ],
    details:
      'Amoxicillin is a commonly prescribed antibiotic in Pakistan for bacterial infections.',
    ingredients: ['Amoxicillin trihydrate'],
    dosage: 'Adults: 250-500mg every 8 hours.',
    usage: 'Complete the full course as prescribed.',
    warnings: [
      'Do not use if allergic to penicillin',
      'Report rash or diarrhoea to doctor',
    ],
    category: 'Antibiotic',
    uses: [
      'Respiratory tract infections',
      'Urinary tract infections',
      'Skin infections',
    ],
    sideEffects: ['Diarrhoea', 'Nausea', 'Skin rash'],
    isAuthentic: true,
  },
  {
    id: '4',
    medicineName: 'Ibuprofen Syrup',
    manufacturer: 'Various',
    activeIngredient: 'Ibuprofen',
    strength: '100mg/5ml',
    pros: [
      'Suitable for children',
      'Pleasant taste',
      'Effective for fever and pain',
    ],
    cons: [
      'Must dose carefully by weight',
      'Can cause stomach upset',
    ],
    details:
      'Ibuprofen syrup is used for children\'s fever and pain relief in Pakistan.',
    ingredients: ['Ibuprofen'],
    dosage: 'Children: 5-10mg/kg every 6-8 hours.',
    usage: 'Shake well before use. Use measuring device provided.',
    warnings: [
      'Do not give to dehydrated children',
      'Consult doctor for infants under 6 months',
    ],
    category: 'Paediatric Pain & Fever',
    uses: ['Fever reduction', 'Teething pain', 'Post-vaccination fever'],
    sideEffects: ['Stomach upset', 'Vomiting (rare)'],
    isAuthentic: true,
  },
];

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
