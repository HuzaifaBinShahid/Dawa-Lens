const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      index: true,
    },
    pros: {
      type: [String],
      default: [],
    },
    cons: {
      type: [String],
      default: [],
    },
    details: {
      type: String,
      default: '',
    },
    ingredients: {
      type: [String],
      default: [],
    },
    dosage: {
      type: String,
      default: '',
    },
    usage: {
      type: String,
      default: '',
    },
    warnings: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'Medicines',
  }
);

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;