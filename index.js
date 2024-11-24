const express = require('express');
const { connectToDatabase,connectDB } = require('./config/db');
const routes = require('./routes');
 
const app = express();
const port = 3000;

connectToDatabase();
connectDB();
app.use(express.json());
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
