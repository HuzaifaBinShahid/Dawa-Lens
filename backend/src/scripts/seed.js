require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db/connection');
const Medicine = require('../models/Medicine');

const pakistaniMedicines = [
  {
    medicineName: 'Panadol',
    pros: ['Widely available in Pakistan', 'Effective for mild to moderate pain and fever', 'Generally well tolerated', 'Suitable for most age groups'],
    cons: ['Overuse can cause liver damage', 'Not suitable for severe pain', 'May mask symptoms of serious conditions'],
    details: 'Panadol (paracetamol) is one of the most commonly used pain and fever relievers in Pakistan. It is manufactured by GSK and available over the counter at pharmacies nationwide. Safe when used as directed.',
    ingredients: ['Paracetamol (Acetaminophen)'],
    dosage: 'Adults: 500mg–1g every 4–6 hours, max 4g/day. Children: 10–15mg/kg per dose.',
    usage: 'Take with or after food. Swallow tablet with water. Do not exceed recommended dose. Used for headache, fever, toothache, muscle pain, and cold/flu symptoms.',
    warnings: ['Do not use with other paracetamol-containing products', 'Avoid alcohol during use', 'Consult doctor if pregnant or breastfeeding', 'Seek help if overdose suspected'],
    category: 'Pain Relief & Fever',
    isActive: true,
  },
  {
    medicineName: 'Brufen',
    pros: ['Reduces pain and inflammation', 'Commonly prescribed in Pakistan', 'Effective for joint and muscle pain', 'Available in tablet and syrup forms'],
    cons: ['Can cause stomach upset or ulcers', 'Not suitable for asthma patients in some cases', 'May increase bleeding risk'],
    details: 'Brufen (ibuprofen) is a popular NSAID used across Pakistan for pain, fever, and inflammation. Manufactured by Abbott. Often used for period pain, backache, and arthritis.',
    ingredients: ['Ibuprofen'],
    dosage: 'Adults: 200–400mg every 4–6 hours, max 1200mg/day (or as prescribed). Take with food.',
    usage: 'Take with food or milk to reduce stomach irritation. Used for headaches, dental pain, menstrual pain, muscle aches, and fever.',
    warnings: ['Do not use if you have stomach ulcers or bleeding', 'Caution in heart/kidney disease', 'Avoid in late pregnancy', 'Do not exceed recommended dose'],
    category: 'Pain Relief & Anti-inflammatory',
    isActive: true,
  },
  {
    medicineName: 'Disprin',
    pros: ['Fast-acting pain and fever relief', 'Low-dose used for heart protection', 'Readily available in Pakistani pharmacies'],
    cons: ['Can cause stomach irritation', 'Not suitable for children with viral infections (Reye\'s syndrome risk)', 'Blood thinning effect'],
    details: 'Disprin (soluble aspirin) is widely used in Pakistan for pain, fever, and as a blood thinner. Bayer product. Often kept at home for quick relief.',
    ingredients: ['Aspirin (Acetylsalicylic acid)'],
    dosage: 'Pain/fever: 300–600mg every 4–6 hours. Low-dose (75mg) for heart: as prescribed by doctor.',
    usage: 'Dissolve in water and drink. Take after food. Used for headache, fever, body aches, and cardiovascular prevention when prescribed.',
    warnings: ['Avoid in children and teenagers with flu/chickenpox', 'Can cause stomach bleeding', 'Interacts with blood thinners', 'Consult doctor before long-term use'],
    category: 'Pain Relief & Antipyretic',
    isActive: true,
  },
  {
    medicineName: 'Flagyl',
    pros: ['Effective against many bacterial and parasitic infections', 'Commonly used in Pakistan for gut and dental infections', 'Well-established safety profile'],
    cons: ['Cannot drink alcohol during and shortly after treatment', 'May cause metallic taste and nausea', 'Resistance can develop'],
    details: 'Flagyl (metronidazole) is a widely used antibiotic/antiprotozoal in Pakistan for stomach infections, dental abscesses, and certain parasitic infections. Sanofi product.',
    ingredients: ['Metronidazole'],
    dosage: 'Adults: typically 400–500mg 2–3 times daily for 5–7 days (as prescribed). Take with food.',
    usage: 'Complete full course even if you feel better. Used for amoebiasis, giardiasis, bacterial vaginosis, dental infections, and anaerobic infections.',
    warnings: ['Do not consume alcohol during and 48 hours after treatment', 'May cause dizziness; avoid driving if affected', 'Notify doctor if pregnant or breastfeeding'],
    category: 'Antibiotic & Antiprotozoal',
    isActive: true,
  },
  {
    medicineName: 'Augmentin',
    pros: ['Broad-spectrum antibiotic', 'Used for many common infections in Pakistan', 'Available as tablets and suspension for children'],
    cons: ['Can cause diarrhoea', 'Allergic reactions possible in penicillin-sensitive patients', 'Should be taken as prescribed only'],
    details: 'Augmentin (amoxicillin + clavulanic acid) is a commonly prescribed antibiotic in Pakistan for ear, throat, sinus, and urinary tract infections. GSK product.',
    ingredients: ['Amoxicillin', 'Clavulanic acid (potassium clavulanate)'],
    dosage: 'Adults: 500/125mg or 875/125mg twice daily (as prescribed). Children: dose by weight. Take at start of meal.',
    usage: 'Take at regular intervals. Complete full course. Used for respiratory infections, urinary tract infections, skin infections, and dental infections.',
    warnings: ['Do not use if allergic to penicillin', 'Report diarrhoea or rash to doctor', 'Use only when prescribed by a doctor'],
    category: 'Antibiotic',
    isActive: true,
  },
  {
    medicineName: 'Nims',
    pros: ['Fast pain and fever relief', 'Popular in Pakistan for body aches and fever', 'Available as tablets and suspension'],
    cons: ['Not recommended for long-term use', 'Liver concerns in some patients', 'Banned in some countries; use with medical advice'],
    details: 'Nims (nimesulide) is an NSAID used in Pakistan for acute pain and fever. Often used for dental pain, post-surgical pain, and musculoskeletal pain. Use short-term only.',
    ingredients: ['Nimesulide'],
    dosage: 'Adults: 100mg twice daily after meals, for max 15 days. Not for children under 12.',
    usage: 'Take after meals. Short-term use only. Used for acute pain, fever, and inflammation.',
    warnings: ['Use only for short period', 'Avoid in liver disease', 'Not for children under 12', 'Consult doctor before use'],
    category: 'Pain Relief & Anti-inflammatory',
    isActive: true,
  },
  {
    medicineName: 'Calpol',
    pros: ['Safe for children', 'Widely used in Pakistan for kids\' fever and pain', 'Available in syrup and sachets', 'Pleasant taste for compliance'],
    cons: ['Overdose can be harmful to liver', 'Must use correct dose by weight/age'],
    details: 'Calpol (paracetamol for children) is the go-to medicine for children\'s fever and pain in Pakistan. GSK product. Available in different strengths for different ages.',
    ingredients: ['Paracetamol (Acetaminophen)'],
    dosage: 'Based on child\'s weight: 10–15mg/kg per dose, every 4–6 hours, max 4 doses in 24 hours. Use measuring device provided.',
    usage: 'Shake bottle before use. Use syringe or spoon provided. For fever, teething pain, and post-vaccination fever in children.',
    warnings: ['Do not give with other paracetamol products', 'Do not exceed recommended dose', 'Keep out of reach of children', 'Check expiry and strength'],
    category: 'Paediatric Pain & Fever',
    isActive: true,
  },
  {
    medicineName: 'Rantac',
    pros: ['Relieves heartburn and acidity', 'Commonly used in Pakistan', 'Available over the counter', 'Reduces stomach acid production'],
    cons: ['Long-term use may affect vitamin B12 and bone', 'Can interact with other medicines'],
    details: 'Rantac (ranitidine) was widely used in Pakistan for acidity, GERD, and stomach ulcers. Now often replaced by omeprazole; check availability and doctor\'s advice.',
    ingredients: ['Ranitidine hydrochloride'],
    dosage: '150mg twice daily or 300mg at bedtime for acidity. For ulcers: as prescribed by doctor.',
    usage: 'Take before meals or at bedtime. Used for heartburn, acid reflux, stomach ulcers, and indigestion.',
    warnings: ['Consult doctor for long-term use', 'Report persistent symptoms', 'Inform doctor of other medications'],
    category: 'Antacid & Anti-ulcer',
    isActive: true,
  },
  {
    medicineName: 'Ponstan',
    pros: ['Effective for menstrual pain', 'Used for muscle and joint pain in Pakistan', 'Available in tablet form'],
    cons: ['Can cause stomach upset', 'Not suitable for asthma or ulcer patients', 'May cause dizziness'],
    details: 'Ponstan (mefenamic acid) is commonly used in Pakistan for period pain, headache, and musculoskeletal pain. Pfizer product. Take with food.',
    ingredients: ['Mefenamic acid'],
    dosage: 'Adults: 500mg initially, then 250mg every 6 hours as needed. Take with food. Not for long-term use without doctor advice.',
    usage: 'Take with food or milk. Used for menstrual pain, headache, dental pain, and mild to moderate pain.',
    warnings: ['Avoid if you have stomach/duodenal ulcer', 'Caution in asthma', 'Do not use in third trimester of pregnancy', 'Short-term use only unless prescribed'],
    category: 'Pain Relief (Menstrual & General)',
    isActive: true,
  },
  {
    medicineName: 'Livogen',
    pros: ['Treats iron deficiency anaemia', 'Common in Pakistan due to diet and pregnancy', 'Contains iron and folic acid', 'Available as capsules and syrup'],
    cons: ['Can cause constipation', 'May cause stomach upset', 'Stools may turn dark'],
    details: 'Livogen is a popular haematinic in Pakistan for anaemia. Used during pregnancy, in women with heavy periods, and in people with poor diet. Abbott product.',
    ingredients: ['Ferrous fumarate (Iron)', 'Folic acid', 'Vitamin B12 (in some formulations)'],
    dosage: 'Adults: 1–2 capsules daily or as prescribed. Take on empty stomach with water or orange juice for better absorption.',
    usage: 'Take as directed. Often used for 2–3 months to correct anaemia. Used in pregnancy and iron deficiency.',
    warnings: ['Keep out of reach of children; overdose can be fatal', 'May cause constipation; increase fluids and fibre', 'Do not take with tea/coffee (reduces absorption)'],
    category: 'Haematinic (Iron & Vitamins)',
    isActive: true,
  },
];

async function seed() {
  try {
    await connectDB();
    const existing = await Medicine.countDocuments();
    if (existing > 0) {
      console.log(`Database already has ${existing} medicines. Clearing and re-seeding...`);
      await Medicine.deleteMany({});
    }
    await Medicine.insertMany(pakistaniMedicines);
    console.log(`Seeded ${pakistaniMedicines.length} Pakistani medicines successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
