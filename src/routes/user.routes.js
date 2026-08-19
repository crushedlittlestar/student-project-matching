const express = require("express");
const { getMe } = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/users/me", authenticate, getMe);

module.exports = router;