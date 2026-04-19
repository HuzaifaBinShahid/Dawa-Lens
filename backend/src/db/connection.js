const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/MedicinesDB';
  const isAtlas = uri.startsWith('mongodb+srv');
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    const label = isAtlas ? 'MongoDB Atlas' : 'MongoDB';
    console.log(`${label} connected: ${conn.connection.host} (db: ${conn.connection.name})`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
