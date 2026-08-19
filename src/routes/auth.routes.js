const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const {
    registerSchema,
    loginSchema
} = require("../validations/auth.validation");

const router = express.Router();

router.post(
    "/auth/register",
    validate(registerSchema),
    register
);

router.post(
    "/auth/login",
    validate(loginSchema),
    login
);

module.exports = router;