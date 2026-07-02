import Joi from "joi";

export type SchemaMap = Joi.PartialSchemaMap;

/**
 * Validates data against a plain map of Joi validators. Array payloads
 * are validated item by item against the same map. All errors are
 * collected (abortEarly: false) so clients get the full picture at once.
 */
export const validate = (data: unknown, schemaMap: SchemaMap): Joi.ValidationResult => {
	if (Array.isArray(data)) {
		return Joi.array().items(Joi.object(schemaMap)).validate(data, { abortEarly: false });
	}
	return Joi.object(schemaMap).validate(data, { abortEarly: false });
};
