const User = require("../models/user.model");

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMe
};