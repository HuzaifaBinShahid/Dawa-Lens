const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema(
  {
    form: { type: String },
    code: { type: String, default: null },
    size: { type: String },
    tp: { type: String, default: null },
    mrp: { type: String, default: null },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    brand: { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    variants: { type: [VariantSchema], default: [] },
  },
  { _id: false }
);

const MedicineSchema = new mongoose.Schema(
  {
    drug_name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    content: { type: String },
    forms: { type: [String], default: [] },
    indications: { type: [String], default: [] },
    dosage: { type: mongoose.Schema.Types.Mixed, default: {} },
    contraindications: { type: [String], default: [] },
    precautions: { type: [String], default: [] },
    interactions: { type: [String], default: [] },
    side_effects: { type: [String], default: [] },
    administration: { type: String, default: null },
    stability: { type: String, default: null },
    pregnancy: { type: String, default: null },
    lactation: { type: String, default: null },
    products: { type: [ProductSchema], default: [] },
    _processed_at: { type: Date },
    _source: { type: String },
  },
  {
    collection: process.env.DB_COLLECTION || 'medicines',
    timestamps: false,
    strict: false,
  }
);

MedicineSchema.index(
  { drug_name: 'text', 'products.brand': 'text', category: 'text' },
  {
    weights: { drug_name: 10, 'products.brand': 8, category: 3 },
    name: 'MedicineTextIndex',
  }
);

MedicineSchema.index(
  { drug_name: 1 },
  { collation: { locale: 'en', strength: 2 }, name: 'DrugNameCI' }
);

MedicineSchema.index({ 'products.brand': 1 }, { name: 'ProductBrand' });

module.exports = mongoose.model('Medicine', MedicineSchema);
