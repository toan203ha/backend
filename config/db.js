const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URL || 'mongodb+srv://pontax:qyPYHjaViAgFviYB@cluster0.068c8rk.mongodb.net/CUAHANGBANSACH?retryWrites=true&w=majority';
const dbName = 'CUAHANGBANSACH';

async function connectDB() {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Mongoose connected successfully');
  } catch (err) {
    console.error('Mongoose connection error:', err);
    process.exit(1); // Dừng chương trình nếu kết nối thất bại
  }
};

let db;
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
  } catch (err) {
    console.error(err);
  }
}

function getDb() {
  return db;
}
module.exports = { connectToDatabase, getDb,connectDB };
