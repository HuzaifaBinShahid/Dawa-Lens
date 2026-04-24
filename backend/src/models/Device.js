const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true, index: true, trim: true },
    platform: { type: String, trim: true },
    osVersion: { type: String, trim: true },
    appVersion: { type: String, trim: true },
    model: { type: String, trim: true },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { collection: 'devices', timestamps: false }
);

module.exports = mongoose.model('Device', DeviceSchema);
