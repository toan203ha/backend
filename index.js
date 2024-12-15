const express = require('express');
const {connectDB } = require('./config/db');
const routes = require('./routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = 3000;
 
const dbPass = process.env.JWT_SECRET;
console.log(`Connecting to database at ${dbPass} with user ${dbPass}...`);

//connectToDatabase();
connectDB();
app.use(express.json());
app.use('/api', routes);
app.use(cookieParser());
app.use(cors({ origin: 'https://localhost:7020', credentials: true }));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
