require('dotenv').config();
const express = require('express');
const connectDB = require('./db/connection');
const Medicine = require('./models/Medicine');

const app = express();
app.use(express.json());

connectDB();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Medicines API is running' });
});

app.get('/api/medicines', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/medicines', async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/medicines/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});