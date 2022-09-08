const Joi = require("joi");

const validators = {
  registerValidator: Joi.object({
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
  }),
};

module.exports = validators;
