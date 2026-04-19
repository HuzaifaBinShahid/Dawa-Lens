require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db/connection');
const Medicine = require('../models/Medicine');

const uri = process.env.MONGODB_URI || '';
if (uri.startsWith('mongodb+srv')) {
  console.error('Refusing to seed: MONGODB_URI points to Atlas. Seed is only for local development.');
  console.error('Unset MONGODB_URI or point it to a local mongodb://... instance and retry.');
  process.exit(1);
}

const sampleMedicines = [
  {
    drug_name: 'GLYDALE',
    category: 'Corticosteroid/ LABA / LAMA',
    content:
      'Per DPI Cap: Indacaterol 150mcg, Glycopyrronium 50mcg and Mometasone Furoate 160mcg. Caps to be used by inhalation device.',
    forms: ['DPI Cap'],
    indications: [
      'Maintenance treatment of Asthma not adequately controlled with a combination of a long-acting beta2-agonist and an inhaled corticosteroid',
    ],
    dosage: {
      'Adult (BY INHALATION)': '1 inhalation daily to be administered at the same time of the day each day.',
    },
    contraindications: [],
    precautions: [
      'Cardiovascular or convulsive disorders',
      'Renal or hepatic impairment',
      'Risk of paradoxical bronchospasm (discontinue immediately)',
      'Should not be administered concomitantly with medicinal products containing other long-acting beta-adrenergic agonists or long-acting muscarinic antagonists.',
    ],
    interactions: [
      'Beta-adrenergic blockers',
      'Anticholinergics',
      'Sympathomimetics',
      'Methylxanthine derivatives',
      'Steroids or non-potassium-sparing diuretics',
      'Cimetidine',
    ],
    side_effects: [
      'Headache',
      'Hypersensitivity',
      'Musculoskeletal pain',
      'Dry mouth',
      'Palpitations',
      'Paraesthesia',
      'Ischaemic heart disease',
      'Atrial fibrillation',
      'Tachycardia',
    ],
    administration: null,
    stability: null,
    pregnancy: null,
    lactation: null,
    products: [
      {
        brand: 'GLYDALE',
        manufacturer: 'HORIZON',
        variants: [
          { form: 'DPI Cap', code: null, size: '150mcg/50mcg/160mcg', tp: null, mrp: null },
        ],
      },
    ],
    _processed_at: new Date(),
    _source: 'manual_text_input',
  },
  {
    drug_name: 'PANADOL',
    category: 'Analgesic / Antipyretic',
    content: 'Each tablet contains Paracetamol 500mg. Relieves mild to moderate pain and fever.',
    forms: ['Tablet'],
    indications: ['Headache', 'Toothache', 'Fever', 'Muscle and joint pain', 'Cold and flu symptoms'],
    dosage: {
      'Adult': '500mg–1g every 4–6 hours, max 4g per day.',
      'Child (6–12 years)': '250–500mg every 4–6 hours.',
    },
    contraindications: ['Severe liver impairment', 'Known hypersensitivity to paracetamol'],
    precautions: [
      'Avoid alcohol during use',
      'Consult doctor if pregnant or breastfeeding',
      'Do not exceed recommended dose',
    ],
    interactions: ['Warfarin', 'Other paracetamol-containing products'],
    side_effects: ['Nausea', 'Stomach upset', 'Skin rash (rare)'],
    administration: 'Take with or after food. Swallow with water.',
    stability: null,
    pregnancy: 'Generally considered safe in pregnancy when used as directed.',
    lactation: 'Compatible with breastfeeding.',
    products: [
      {
        brand: 'PANADOL',
        manufacturer: 'GSK',
        variants: [
          { form: 'Tablet', code: null, size: '500mg', tp: null, mrp: null },
        ],
      },
    ],
    _processed_at: new Date(),
    _source: 'manual_text_input',
  },
  {
    drug_name: 'BRUFEN',
    category: 'NSAID / Analgesic',
    content: 'Each tablet contains Ibuprofen 400mg. Reduces pain, inflammation, and fever.',
    forms: ['Tablet', 'Syrup'],
    indications: ['Headache', 'Dental pain', 'Menstrual pain', 'Muscle aches', 'Fever'],
    dosage: {
      'Adult': '200–400mg every 4–6 hours, max 1200mg per day.',
    },
    contraindications: ['Active peptic ulcer', 'Severe heart failure', 'Third trimester of pregnancy'],
    precautions: ['Caution in heart or kidney disease', 'Take with food to reduce stomach irritation'],
    interactions: ['Warfarin', 'Aspirin', 'ACE inhibitors', 'Diuretics'],
    side_effects: ['Stomach pain', 'Heartburn', 'Dizziness', 'Nausea'],
    administration: 'Take with food or milk.',
    stability: null,
    pregnancy: 'Avoid in the third trimester.',
    lactation: 'Small amounts excreted in breast milk; generally considered safe.',
    products: [
      {
        brand: 'BRUFEN',
        manufacturer: 'Abbott',
        variants: [
          { form: 'Tablet', code: null, size: '400mg', tp: null, mrp: null },
          { form: 'Syrup', code: null, size: '100mg/5ml', tp: null, mrp: null },
        ],
      },
    ],
    _processed_at: new Date(),
    _source: 'manual_text_input',
  },
];

const run = async () => {
  await connectDB();
  try {
    await Medicine.deleteMany({});
    const inserted = await Medicine.insertMany(sampleMedicines);
    console.log(`Seeded ${inserted.length} medicines into collection "${Medicine.collection.collectionName}".`);
    await Medicine.syncIndexes();
    console.log('Indexes synced.');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
