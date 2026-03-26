# Medicines Backend

Node.js + Express + MongoDB backend for the medicines app.

## Setup

1. Copy `.env.example` to `.env` and set `MONGODB_URI` (default: `mongodb://localhost:27017/medicines-db`).
2. Install dependencies: `npm install`
3. Ensure MongoDB is running locally (or use MongoDB Atlas and set `MONGODB_URI`).
4. Start: `npm run dev` or `npm start`

## Medicine schema

- **medicineName** (required) – string
- **pros** – array of strings
- **cons** – array of strings
- **details** – string
- **ingredients** – array of strings
- **dosage** – string
- **usage** – string
- **warnings** – array of strings
- **category** – string
- **isActive** – boolean (default: true)
- **createdAt** / **updatedAt** – auto timestamps

## API

- `GET /health` – health check
- `GET /api/medicines` – list all medicines
- `GET /api/medicines/:id` – get one medicine
- `POST /api/medicines` – create medicine (JSON body)
