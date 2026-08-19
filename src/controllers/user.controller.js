const User = require("../models/user.model");
const bcrypt = require("bcrypt");

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

const updateMe = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name !== undefined) {
            user.name = name;
        }

        if (email !== undefined) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: user._id }
            });

            if (existingUser) {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }

            user.email = email;
        }

        if (password !== undefined) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                accountStatus: user.accountStatus
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMe,
    updateMe
};