const express = require('express');
const { connectToDatabase } = require('./db');
const routes = require('./routes');

const app = express();
const port = 3000;

connectToDatabase();

app.use(express.json());
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
