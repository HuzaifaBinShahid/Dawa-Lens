const express = require('express');
const mongoose = require('mongoose');
const History = require('../models/History');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    if (!req.deviceId) {
      return res.status(400).json({ error: 'Missing X-Device-Id header' });
    }
    const { type, medicineId, query, matchedBrand } = req.body || {};
    if (type !== 'scan' && type !== 'search') {
      return res.status(400).json({ error: 'type must be "scan" or "search"' });
    }
    const doc = await History.create({
      deviceId: req.deviceId,
      type,
      medicineId:
        medicineId && mongoose.isValidObjectId(medicineId) ? medicineId : null,
      query: typeof query === 'string' ? query.trim() || null : null,
      matchedBrand:
        typeof matchedBrand === 'string' ? matchedBrand.trim() || null : null,
      timestamp: new Date(),
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to log history' });
  }
});

router.get('/', async (req, res) => {
  try {
    if (!req.deviceId) {
      return res.json([]);
    }
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const type = req.query.type;
    const filter = { deviceId: req.deviceId };
    if (type === 'scan' || type === 'search') filter.type = type;
    const items = await History.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('medicineId', 'drug_name category content forms products')
      .lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch history' });
  }
});

module.exports = router;
