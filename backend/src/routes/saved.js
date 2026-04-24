const express = require('express');
const mongoose = require('mongoose');
const Saved = require('../models/Saved');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    if (!req.deviceId) {
      return res.status(400).json({ error: 'Missing X-Device-Id header' });
    }
    const { medicineId } = req.body || {};
    if (!medicineId || !mongoose.isValidObjectId(medicineId)) {
      return res.status(400).json({ error: 'Valid medicineId is required' });
    }
    const doc = await Saved.findOneAndUpdate(
      { deviceId: req.deviceId, medicineId },
      { $setOnInsert: { deviceId: req.deviceId, medicineId, savedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to save medicine' });
  }
});

router.delete('/:medicineId', async (req, res) => {
  try {
    if (!req.deviceId) {
      return res.status(400).json({ error: 'Missing X-Device-Id header' });
    }
    const { medicineId } = req.params;
    if (!mongoose.isValidObjectId(medicineId)) {
      return res.status(400).json({ error: 'Invalid medicineId' });
    }
    await Saved.deleteOne({ deviceId: req.deviceId, medicineId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to unsave medicine' });
  }
});

router.get('/', async (req, res) => {
  try {
    if (!req.deviceId) {
      return res.json([]);
    }
    const items = await Saved.find({ deviceId: req.deviceId })
      .sort({ savedAt: -1 })
      .populate('medicineId', 'drug_name category content forms products')
      .lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch saved' });
  }
});

module.exports = router;
