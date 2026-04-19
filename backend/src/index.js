require('dotenv').config();
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connection');
const medicinesRouter = require('./routes/medicines');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

connectDB();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Medicines API is running' });
});

app.use('/api/medicines', medicinesRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
