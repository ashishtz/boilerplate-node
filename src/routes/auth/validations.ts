import Joi from "joi";
import type { ValidationSchemas } from "../../middlewares/xacml";

export const loginValidation: ValidationSchemas = {
	body: {
		email: Joi.string().email().required(),
		password: Joi.string().required(),
		rememberMe: Joi.boolean().optional(),
	},
};

export const registerValidation: ValidationSchemas = {
	body: {
		name: Joi.string().trim().min(2).max(250).required(),
		email: Joi.string().email().max(250).required(),
		password: Joi.string().min(8).max(128).required(),
		phone: Joi.string()
			.pattern(/^\+?[0-9]{7,15}$/)
			.required(),
	},
};
