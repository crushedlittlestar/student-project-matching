const express = require("express");
const { getMe, updateMe } = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { updateProfileSchema } = require("../validations/auth.validation");

const router = express.Router();

router.get("/users/me", authenticate, getMe);

router.patch(
    "/users/me",
    authenticate,
    validate(updateProfileSchema),
    updateMe
);

module.exports = router;