const express = require('express');
const morgan = require('morgan');
const logger = require('./utils/logger');

const app = express();

// stream morgan's request logs into winston instead of console
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));


app.use(express.json());

app.use('/api', require('./routes'));

app.use(require('./middlewares/error.middleware'));

module.exports = app;