const winston = require('winston');

// Central logger for the whole app. Anyone on the team can import this
// and call logger.info(...) / logger.error(...) instead of console.log,
// so all logs end up in one consistent format and in the same files.
const logger = winston.createLogger({
  level: 'info', // logs 'info' level and anything more severe (warn, error)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    // prints logs live in the terminal while the server is running

    new winston.transports.Console(),

   // only error-level logs go here, so it's quick to scan for real problems

    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),

  // every log (info + error) goes here for full history

    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// IMPORTANT: never log sensitive data through this logger —
// no passwords, no JWT tokens, no full request bodies from auth routes.

module.exports = logger;