const express = require('express');
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');

const router = express.Router();

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const tieredSearch = async (q, { limit = 5 } = {}) => {
  const term = (q || '').trim();
  if (!term) return { best: null, alternates: [] };

  const exact = await Medicine.findOne({
    $or: [{ drug_name: term }, { 'products.brand': term }],
  })
    .collation({ locale: 'en', strength: 2 })
    .lean();

  if (exact) {
    const siblings = await Medicine.find({
      _id: { $ne: exact._id },
      drug_name: { $regex: `^${escapeRegex(term)}`, $options: 'i' },
    })
      .limit(limit - 1)
      .lean();
    return { best: exact, alternates: siblings };
  }

  const prefixHits = await Medicine.find({
    drug_name: { $regex: `^${escapeRegex(term)}`, $options: 'i' },
  })
    .limit(limit)
    .lean();

  if (prefixHits.length > 0) {
    const [best, ...alternates] = prefixHits;
    return { best, alternates };
  }

  const textHits = await Medicine.find(
    { $text: { $search: term } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();

  if (textHits.length > 0) {
    const [best, ...alternates] = textHits;
    return { best, alternates };
  }

  return { best: null, alternates: [] };
};

router.get('/search', async (req, res) => {
  try {
    const { q, limit } = req.query;
    const result = await tieredSearch(q, { limit: Number(limit) || 5 });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { q, limit = 20, skip = 0 } = req.query;
    const numericLimit = Math.min(Number(limit) || 20, 50);
    const numericSkip = Number(skip) || 0;

    if (q && q.trim()) {
      const term = q.trim();
      const results = await Medicine.find({
        $or: [
          { drug_name: { $regex: `^${escapeRegex(term)}`, $options: 'i' } },
          { 'products.brand': { $regex: `^${escapeRegex(term)}`, $options: 'i' } },
        ],
      })
        .limit(numericLimit)
        .skip(numericSkip)
        .lean();
      return res.json(results);
    }

    const list = await Medicine.find()
      .sort({ drug_name: 1 })
      .limit(numericLimit)
      .skip(numericSkip)
      .lean();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid medicine id' });
    }
    const medicine = await Medicine.findById(id).lean();
    if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
