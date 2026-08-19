require('dotenv').config()
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_project_matching';

async function start() {
  await mongoose.connect(MONGO_URI);
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Projects/Categories module listening on port ${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
