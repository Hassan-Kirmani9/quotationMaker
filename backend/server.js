const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const routes = require('./routes');
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://luminous-rolypoly-9e31ea.netlify.app'],
  credentials: true
})); app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static('uploads'));

const connectDB = require('./config/db');
connectDB();


app.use('/api', routes);


app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Quotation Maker API is running!',
    timestamp: new Date().toISOString()
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;