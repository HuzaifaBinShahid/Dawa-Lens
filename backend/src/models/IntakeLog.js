const mongoose = require('mongoose');

const IntakeLogSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true, trim: true },
    trackerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tracker',
      required: true,
      index: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    // Local-date tag (YYYY-MM-DD). Treat as a string label, not a UTC instant.
    scheduledDate: { type: String, required: true, index: true },
    timeLabel: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      required: true,
    },
    scheduledHour: { type: Number, min: 0, max: 23, required: true },
    scheduledMinute: { type: Number, min: 0, max: 59, default: 0 },
    status: {
      type: String,
      enum: ['taken', 'skipped', 'missed'],
      required: true,
    },
    takenAt: { type: Date, default: null },
  },
  { collection: 'intake_logs', timestamps: true }
);

IntakeLogSchema.index(
  { deviceId: 1, trackerId: 1, scheduledDate: 1, timeLabel: 1 },
  { unique: true }
);
IntakeLogSchema.index({ deviceId: 1, scheduledDate: 1 });

module.exports = mongoose.model('IntakeLog', IntakeLogSchema);
