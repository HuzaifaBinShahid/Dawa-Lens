const express = require('express');
const mongoose = require('mongoose');
const Tracker = require('../models/Tracker');
const IntakeLog = require('../models/IntakeLog');

const router = express.Router();

const requireDevice = (req, res) => {
  if (!req.deviceId) {
    res.status(400).json({ error: 'Missing X-Device-Id header' });
    return false;
  }
  return true;
};

const toDateKey = (d) => {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

const parseDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const toDayStart = (d) => {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// POST /api/trackers — create
router.post('/', async (req, res) => {
  try {
    if (!requireDevice(req, res)) return;
    const {
      medicineId,
      medicineName,
      dosage,
      frequency,
      timesOfDay,
      tagColor,
      notes,
      startDate,
      endDate,
    } = req.body || {};

    if (!medicineId || !mongoose.isValidObjectId(medicineId)) {
      return res.status(400).json({ error: 'Valid medicineId is required' });
    }
    if (!dosage || typeof dosage.amount !== 'number') {
      return res.status(400).json({ error: 'dosage.amount is required' });
    }
    if (!Array.isArray(timesOfDay) || timesOfDay.length === 0) {
      return res.status(400).json({ error: 'timesOfDay must be a non-empty array' });
    }

    const doc = await Tracker.create({
      deviceId: req.deviceId,
      medicineId,
      medicineName: medicineName || '',
      dosage,
      frequency: frequency || { type: 'daily' },
      timesOfDay,
      tagColor: tagColor || '#005FB8',
      notes: notes || '',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      active: true,
    });
    res.status(201).json(doc.toObject());
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create tracker' });
  }
});

// GET /api/trackers — list active for device
router.get('/', async (req, res) => {
  try {
    if (!req.deviceId) return res.json([]);
    const docs = await Tracker.find({ deviceId: req.deviceId, active: true })
      .sort({ createdAt: -1 })
      .populate('medicineId', 'drug_name category content forms products')
      .lean();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch trackers' });
  }
});

// PATCH /api/trackers/:id — update
router.patch('/:id', async (req, res) => {
  try {
    if (!requireDevice(req, res)) return;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid tracker id' });
    }
    const updates = { ...req.body };
    delete updates.deviceId;
    delete updates._id;

    const doc = await Tracker.findOneAndUpdate(
      { _id: id, deviceId: req.deviceId },
      { $set: updates },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ error: 'Tracker not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update tracker' });
  }
});

// DELETE /api/trackers/:id — soft-delete (active=false)
router.delete('/:id', async (req, res) => {
  try {
    if (!requireDevice(req, res)) return;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid tracker id' });
    }
    const doc = await Tracker.findOneAndUpdate(
      { _id: id, deviceId: req.deviceId },
      { $set: { active: false } },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ error: 'Tracker not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete tracker' });
  }
});

// GET /api/trackers/schedule?date=YYYY-MM-DD — derive occurrences + logs
router.get('/schedule', async (req, res) => {
  try {
    if (!req.deviceId) return res.json({ date: req.query.date || toDateKey(new Date()), items: [] });
    const dateKey = (req.query.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date))
      ? req.query.date
      : toDateKey(new Date());
    const date = parseDateKey(dateKey);
    const dayOfWeek = date.getDay();

    const trackers = await Tracker.find({ deviceId: req.deviceId, active: true })
      .populate('medicineId', 'drug_name category forms')
      .lean();

    const items = [];
    for (const t of trackers) {
      const startDay = toDayStart(t.startDate);
      const endDay = toDayStart(t.endDate);
      if (startDay && startDay.getTime() > date.getTime()) continue;
      if (endDay && endDay.getTime() < date.getTime()) continue;
      if (t.frequency?.type === 'weekly') {
        const days = t.frequency.daysOfWeek || [];
        if (!days.includes(dayOfWeek)) continue;
      }
      for (const time of t.timesOfDay || []) {
        items.push({
          trackerId: t._id,
          medicineId: t.medicineId?._id || t.medicineId,
          medicineName: t.medicineName || t.medicineId?.drug_name,
          medicineForm: t.medicineId?.forms?.[0] || null,
          dosage: t.dosage,
          tagColor: t.tagColor,
          timeLabel: time.label,
          hour: time.hour,
          minute: time.minute || 0,
          status: null,
          takenAt: null,
        });
      }
    }

    const logs = await IntakeLog.find({
      deviceId: req.deviceId,
      scheduledDate: dateKey,
    }).lean();
    const logMap = new Map();
    for (const l of logs) {
      logMap.set(`${l.trackerId}_${l.timeLabel}`, l);
    }
    for (const item of items) {
      const log = logMap.get(`${item.trackerId}_${item.timeLabel}`);
      if (log) {
        item.status = log.status;
        item.takenAt = log.takenAt;
      }
    }

    items.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));

    res.json({ date: dateKey, items });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch schedule' });
  }
});

// POST /api/trackers/:id/intake — log taken/skipped
router.post('/:id/intake', async (req, res) => {
  try {
    if (!requireDevice(req, res)) return;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid tracker id' });
    }
    const { scheduledDate, timeLabel, status, scheduledHour, scheduledMinute } = req.body || {};
    if (!scheduledDate || !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
      return res.status(400).json({ error: 'Valid scheduledDate (YYYY-MM-DD) required' });
    }
    if (!['morning', 'afternoon', 'evening', 'night'].includes(timeLabel)) {
      return res.status(400).json({ error: 'Invalid timeLabel' });
    }
    if (!['taken', 'skipped', 'missed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const tracker = await Tracker.findOne({ _id: id, deviceId: req.deviceId }).lean();
    if (!tracker) return res.status(404).json({ error: 'Tracker not found' });

    const doc = await IntakeLog.findOneAndUpdate(
      {
        deviceId: req.deviceId,
        trackerId: id,
        scheduledDate,
        timeLabel,
      },
      {
        $set: {
          medicineId: tracker.medicineId,
          status,
          scheduledHour: typeof scheduledHour === 'number' ? scheduledHour : 0,
          scheduledMinute: typeof scheduledMinute === 'number' ? scheduledMinute : 0,
          takenAt: status === 'taken' ? new Date() : null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to log intake' });
  }
});

// GET /api/trackers/adherence?days=7 — % taken vs scheduled in last N days
router.get('/adherence', async (req, res) => {
  try {
    if (!req.deviceId) return res.json({ days: 7, scheduled: 0, taken: 0, percent: 0 });
    const days = Math.max(1, Math.min(30, parseInt(req.query.days, 10) || 7));

    const trackers = await Tracker.find({ deviceId: req.deviceId, active: true }).lean();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let scheduled = 0;
    const dateKeys = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dow = d.getDay();
      dateKeys.push(toDateKey(d));
      for (const t of trackers) {
        const startDay = toDayStart(t.startDate);
        const endDay = toDayStart(t.endDate);
        if (startDay && startDay.getTime() > d.getTime()) continue;
        if (endDay && endDay.getTime() < d.getTime()) continue;
        if (t.frequency?.type === 'weekly') {
          const ds = t.frequency.daysOfWeek || [];
          if (!ds.includes(dow)) continue;
        }
        scheduled += (t.timesOfDay || []).length;
      }
    }

    const taken = await IntakeLog.countDocuments({
      deviceId: req.deviceId,
      scheduledDate: { $in: dateKeys },
      status: 'taken',
    });

    const percent = scheduled === 0 ? 0 : Math.round((taken / scheduled) * 100);
    res.json({ days, scheduled, taken, percent });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to compute adherence' });
  }
});

module.exports = router;
