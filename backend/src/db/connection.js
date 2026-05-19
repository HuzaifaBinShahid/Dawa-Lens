const mongoose = require('mongoose');
const dns = require('dns');

// Many Pakistani ISPs block / filter DNS queries to Mongo Atlas SRV records.
// Force public resolvers on EVERY entry point that uses connectDB so standalone
// scripts (seed, merge, etc.) don't fail with `querySrv ECONNREFUSED`.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/MedicinesDB';
  const isAtlas = uri.startsWith('mongodb+srv');
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      family: 4, // prefer IPv4 — some networks have broken IPv6 DNS
    });
    const label = isAtlas ? 'MongoDB Atlas' : 'MongoDB';
    console.log(`${label} connected: ${conn.connection.host} (db: ${conn.connection.name})`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
