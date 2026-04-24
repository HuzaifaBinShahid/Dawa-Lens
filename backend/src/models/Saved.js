const mongoose = require('mongoose');

const SavedSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true, trim: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    savedAt: { type: Date, default: Date.now, index: true },
  },
  { collection: 'saved', timestamps: false }
);

SavedSchema.index({ deviceId: 1, medicineId: 1 }, { unique: true });
SavedSchema.index({ deviceId: 1, savedAt: -1 });

module.exports = mongoose.model('Saved', SavedSchema);
