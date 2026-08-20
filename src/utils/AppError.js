// Custom error class so we can throw errors with a specific HTTP status code
// from anywhere in the app (controllers, services, etc.) instead of always
// getting a generic 500. Example usage: throw new AppError('Project not found', 404);

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // isOperational marks this as an error WE threw on purpose (a business
    // rule violation, a not-found, etc.) as opposed to a real bug/crash.
    // Useful later if we want to handle "expected" errors differently from
    // unexpected ones (e.g. only alert/log unexpected ones as critical).
    this.isOperational = true; // marks this as an error we threw on purpose
    Error.captureStackTrace(this, this.constructor);

    // Removes this constructor call itself from the stack trace, so the
    // trace points to where the error was actually thrown in our code,
    // not to this file.
  }
}

module.exports = AppError;