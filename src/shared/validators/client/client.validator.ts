import * as Joi from 'joi';

export const clientLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "Email is required!",
      "string.email": "Please provide a valid email address!",
      "any.required": "Email is required!",
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.empty": "Password is required!",
      "string.min": "Password must be at least 6 characters long!",
      "any.required": "Password is required!",
    }),
});

export const clientRegisterSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .required()
    .messages({
      "string.empty": "Name is required!",
      "string.min": "Name must be at least 2 characters long!",
      "any.required": "Name is required!",
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "Email is required!",
      "string.email": "Please provide a valid email address!",
      "any.required": "Email is required!",
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.empty": "Password is required!",
      "string.min": "Password must be at least 6 characters long!",
      "any.required": "Password is required!",
    }),
  phone1: Joi.string().allow("").optional(),
  phone2: Joi.string().allow("").optional(),
  ville: Joi.string().allow("").optional(),
  address: Joi.string().allow("").optional(),
});