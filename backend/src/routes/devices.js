const express = require('express');
const Device = require('../models/Device');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const deviceId = req.deviceId || (req.body && req.body.deviceId);
    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required (header X-Device-Id or body)' });
    }
    const { platform, osVersion, appVersion, model } = req.body || {};
    const now = new Date();
    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        $set: {
          platform: platform || undefined,
          osVersion: osVersion || undefined,
          appVersion: appVersion || undefined,
          model: model || undefined,
          lastSeenAt: now,
        },
        $setOnInsert: { deviceId, firstSeenAt: now },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to register device' });
  }
});

module.exports = router;
