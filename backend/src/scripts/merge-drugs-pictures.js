/* eslint-disable no-console */
/**
 * One-time merge: copy documents from `drugs_pictures` into `medicines`
 * WITHOUT overwriting any existing `medicines` document.
 *
 * For every doc in drugs_pictures:
 *   - If a medicines doc with the same drug_name (case-insensitive) exists
 *     → SKIP entirely. The existing doc is left byte-for-byte unchanged.
 *   - Otherwise
 *     → INSERT a new medicines doc that includes the dvago image fields.
 *
 * Idempotent — running it twice is a no-op on the second run.
 *
 * Usage:
 *   cd backend
 *   npm run merge:drugs-pictures
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db/connection');
const Medicine = require('../models/Medicine');

const SOURCE_COLLECTION = process.env.DRUGS_PICTURES_COLLECTION || 'drugs_pictures';
const COLLATION = { locale: 'en', strength: 2 };

const stripObjectId = (doc) => {
  if (!doc || typeof doc !== 'object') return doc;
  const { _id, __v, ...rest } = doc;
  return rest;
};

const run = async () => {
  await connectDB();

  const conn = mongoose.connection;
  if (!conn || !conn.db) {
    console.error('No active mongoose connection — aborting.');
    process.exit(1);
  }

  const source = conn.db.collection(SOURCE_COLLECTION);
  const total = await source.countDocuments();
  console.log(
    `\n[merge] examining ${total} document(s) in "${SOURCE_COLLECTION}"\n`
  );

  let imported = 0;
  let skipped = 0;
  let failed = 0;
  let i = 0;

  const cursor = source.find({});
  for await (const raw of cursor) {
    i += 1;
    const doc = stripObjectId(raw);
    const drugName =
      typeof doc.drug_name === 'string' ? doc.drug_name.trim() : '';

    if (!drugName) {
      skipped += 1;
      continue;
    }

    try {
      const existing = await Medicine.findOne({ drug_name: drugName })
        .collation(COLLATION)
        .lean();

      if (existing) {
        skipped += 1;
      } else {
        await Medicine.create({
          ...doc,
          drug_name: drugName,
          _processed_at: doc._processed_at || new Date(),
        });
        imported += 1;
      }
    } catch (err) {
      failed += 1;
      console.warn(
        `[merge] failed at #${i} (${drugName}): ${err.message || err}`
      );
    }

    if (i % 200 === 0) {
      console.log(
        `[merge] progress ${i}/${total} · imported=${imported} skipped=${skipped} failed=${failed}`
      );
    }
  }

  console.log('\n[merge] done.');
  console.log(`         examined ${i}`);
  console.log(`         imported ${imported}`);
  console.log(`         skipped  ${skipped}`);
  console.log(`         failed   ${failed}\n`);

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

run().catch(async (err) => {
  console.error('[merge] fatal:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
