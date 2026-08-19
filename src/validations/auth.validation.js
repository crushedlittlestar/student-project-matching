const Joi = require("joi");

const registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required(),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    password: Joi.string()
        .min(6)
        .max(100)
        .required()
});

const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    password: Joi.string()
        .required()
});

const updateProfileSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50),

    email: Joi.string()
        .trim()
        .lowercase()
        .email(),

    password: Joi.string()
        .min(6)
        .max(100)
}).min(1);

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema
};