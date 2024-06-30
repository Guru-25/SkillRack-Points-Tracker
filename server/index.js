// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const pointsRouter = require('./routes/points');
require('dotenv').config();

const app = express();
app.use(cookieParser());
app.use(express.json());

// MongoDB setup
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/api/points', pointsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});