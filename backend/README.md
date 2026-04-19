# Medicines Backend

Node.js + Express + MongoDB backend for DawaLens.

## Setup

1. `cp .env.example .env` and fill in your MongoDB Atlas URI (or a local `mongodb://...` URI for dev).
2. `npm install`
3. `npm run dev` (nodemon) or `npm start`.

### Environment variables

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port (default `3000`) |
| `MONGODB_URI` | Full MongoDB connection string (Atlas `mongodb+srv://...` or local) |
| `DB_COLLECTION` | Collection name inside the target DB (default `medicines`) |

## Medicine schema

```
drug_name          String (required)
category           String
content            String
forms              [String]
indications        [String]
dosage             Object (e.g. { "Adult": "..." })
contraindications  [String]
precautions        [String]
interactions       [String]
side_effects       [String]
administration     String | null
stability          String | null
pregnancy          String | null
lactation          String | null
products           [{ brand, manufacturer, variants: [{ form, code, size, tp, mrp }] }]
_processed_at      Date
_source            String
```

### Indexes
- `text` index on `drug_name`, `products.brand`, `category` (weighted) — full-text/fuzzy.
- Case-insensitive ascending index on `drug_name` (collation `en/strength 2`).
- Ascending index on `products.brand`.

Run `npm run seed` (local DB only) to populate sample data and sync indexes.

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Health check |
| GET | `/api/medicines?q=&limit=&skip=` | List / prefix-filter list |
| GET | `/api/medicines/search?q=<name>&limit=5` | Tiered match (exact → prefix → text). Returns `{ best, alternates }`. |
| GET | `/api/medicines/:id` | Get by ObjectId |

### Example

```
curl http://localhost:3000/api/medicines/search?q=glydale
```

## Seed (local only)
`npm run seed` deletes all docs in the target collection and inserts three sample records (GLYDALE, PANADOL, BRUFEN). Refuses to run if `MONGODB_URI` points to Atlas.
