import Joi from "joi";

export const loginSchemaValidation = {
	body : {
		email : Joi.string().email().required(),
		password : Joi.string().required(),
	},
};
