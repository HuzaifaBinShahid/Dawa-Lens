const mongoose = require('mongoose');

const TimeOfDaySchema = new mongoose.Schema(
  {
    label: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      required: true,
    },
    hour: { type: Number, min: 0, max: 23, required: true },
    minute: { type: Number, min: 0, max: 59, default: 0 },
  },
  { _id: false }
);

const DosageSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    unit: {
      type: String,
      default: 'tablet',
      trim: true,
    },
  },
  { _id: false }
);

const FrequencySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
      required: true,
    },
    // 0 = Sun ... 6 = Sat. Used only when type === 'weekly'
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
  },
  { _id: false }
);

const TrackerSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true, trim: true },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    medicineName: { type: String, trim: true },
    dosage: { type: DosageSchema, required: true },
    frequency: { type: FrequencySchema, required: true },
    timesOfDay: { type: [TimeOfDaySchema], default: [] },
    tagColor: { type: String, default: '#005FB8' },
    notes: { type: String, default: '' },
    startDate: { type: Date, default: () => new Date() },
    endDate: { type: Date, default: null },
    active: { type: Boolean, default: true, index: true },
  },
  { collection: 'trackers', timestamps: true }
);

TrackerSchema.index({ deviceId: 1, active: 1, createdAt: -1 });

module.exports = mongoose.model('Tracker', TrackerSchema);
