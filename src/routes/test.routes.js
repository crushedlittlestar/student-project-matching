const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.get("/test/protected", authenticate, (req, res) => {
    res.status(200).json({
        message: "You are authenticated",
        user: req.user
    });
});

router.get(
    "/test/admin",
    authenticate,
    authorize("Admin"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome Admin"
        });
    }
);

module.exports = router;