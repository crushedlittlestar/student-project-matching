const express = require("express");
const { getMe, updateMe } = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/users/me", authenticate, getMe);
router.patch("/users/me", authenticate, updateMe);

module.exports = router;