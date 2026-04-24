const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true, trim: true },
    type: { type: String, enum: ['scan', 'search'], required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', default: null },
    query: { type: String, trim: true, default: null },
    matchedBrand: { type: String, trim: true, default: null },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { collection: 'histories', timestamps: false }
);

HistorySchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('History', HistorySchema);
