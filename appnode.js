const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URL || 'mongodb+srv://pontax:qyPYHjaViAgFviYB@cluster0.068c8rk.mongodb.net/CUAHANGBANSACH?retryWrites=true&w=majority';
const dbName = 'CUAHANGBANSACH';


// Kết nối đến MongoDB
mongoose.connect('mongodb+srv://pontax:qyPYHjaViAgFviYB@cluster0.068c8rk.mongodb.net/CUAHANGBANSACH?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
