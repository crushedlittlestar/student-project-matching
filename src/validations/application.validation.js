const ApiError = require("../utils/ApiError");

const validateCreateApplication = (body) => {
  const errors = [];

  if (!body.message) {
    errors.push("message is required");
  } else if (typeof body.message !== "string") {
    errors.push("message must be a string");
  } else if (body.message.trim().length < 10) {
    errors.push("message must be at least 10 characters");
  } else if (body.message.trim().length > 1000) {
    errors.push("message must not exceed 1000 characters");
  }

  if (errors.length > 0) {
    throw new ApiError(
      400,
      "Validation failed",
      errors
    );
  }

  return true;
};

module.exports = {
  validateCreateApplication,
};