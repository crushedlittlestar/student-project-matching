/**
 * Standardized application error.
 * Import this in the global Express error handler (owned by Member 6 / Member 1)
 * and format the response as: { success: false, message, errors }
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - human readable message
   * @param {Array<string>} [errors] - optional list of field-level validation errors
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
