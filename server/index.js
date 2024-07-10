const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const pointsRouter = require('./routes/points');
require('dotenv').config();

const app = express();
app.use(cookieParser());
app.use(express.json());

const connectWithRetry = () => {
  console.log('MongoDB connection with retry');
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('MongoDB is connected');
  }).catch(err => {
    console.log('MongoDB connection unsuccessful, retry after 5 seconds.', err);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

app.use('/api/points', pointsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});