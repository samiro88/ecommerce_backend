import * as Joi from 'joi';

export const adminLoginSchema = Joi.object({
  username: Joi.string()
    .min(5)
    .max(12)
    .required()
    .messages({
      "string.empty": "Username is required!",
      "string.min": "Username must be at least 5 characters long!",
      "string.max": "Username must not exceed 12 characters!",
      "any.required": "Username is required!",
    }),
  password: Joi.string()
    .min(8)
    .max(20)
    .required()
    .messages({
      "string.empty": "Password is required!",
      "string.min": "Password must be at least 8 characters long!",
      "string.max": "Password must not exceed 20 characters!",
      "any.required": "Password is required!",
    }),
});