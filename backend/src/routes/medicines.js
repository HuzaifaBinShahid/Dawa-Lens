const express = require('express');
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');

const router = express.Router();

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const tieredSearch = async (q, { limit = 5 } = {}) => {
  const term = (q || '').trim();
  if (!term) return { best: null, alternates: [], matchType: 'none' };

  const exact = await Medicine.findOne({
    $or: [{ drug_name: term }, { 'products.brand': term }],
  })
    .collation({ locale: 'en', strength: 2 })
    .lean();

  if (exact) {
    const siblings = await Medicine.find({
      _id: { $ne: exact._id },
      drug_name: { $regex: `^${escapeRegex(exact.drug_name)}`, $options: 'i' },
    })
      .limit(limit - 1)
      .lean();
    return { best: exact, alternates: siblings, matchType: 'exact' };
  }

  const prefixRegex = { $regex: `^${escapeRegex(term)}`, $options: 'i' };
  const prefixHits = await Medicine.find({
    $or: [{ drug_name: prefixRegex }, { 'products.brand': prefixRegex }],
  })
    .limit(limit)
    .lean();

  if (prefixHits.length > 0) {
    const [best, ...alternates] = prefixHits;
    return { best, alternates, matchType: 'partial' };
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
    return { best, alternates, matchType: 'related' };
  }

  return { best: null, alternates: [], matchType: 'none' };
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

router.post('/extract', async (req, res) => {
  try {
    const { raw_text } = req.body;
    if (!raw_text) {
      return res.status(400).json({ error: 'raw_text is required' });
    }

    // Call Ollama for NER
    const prompt = `You are a medicine label parser. From the following text extracted from a medicine box, identify ONLY the brand/trade name of the medicine. 

Text: "${raw_text}"

Rules:
- Return ONLY the brand name (e.g., "Augmentin", "Panadol", "Brufen")
- Do NOT include: salt names, dosages (mg/ml), manufacturer names, instructions
- If multiple brand names exist, return the most prominent one
- Return ONLY the name, no explanation

Brand name:`;

    let llmName = null;
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'medgemma:4b', // Or your chosen model
          prompt: prompt,
          stream: false
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        llmName = data.response.trim();
      } else {
        console.warn(`Ollama returned error: ${response.status}`);
      }
    } catch (ollamaError) {
       console.warn(`Ollama request failed: ${ollamaError.message}`);
       // Fall back gracefully
    }

    // Search logic using either LLM extracted name or raw text as fallback
    const searchTerm = llmName || raw_text;
    const searchResult = await tieredSearch(searchTerm, { limit: 5 });

    res.json({
        extracted_name: llmName,
        used_llm: !!llmName,
        result: searchResult
    });

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
