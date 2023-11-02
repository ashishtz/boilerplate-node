import transform from "./lang";
import { Construct } from "./types";
import { NextFunction, Request, Response } from "express";
import XacmlHelper from "./XacmlClass";

export default ({
	pre = [], validation, secondaryValidations 
}: Omit<Construct, "preRequest">) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const {
				body, params, query, user, headers 
			} = req;
			const xacml = new XacmlHelper({
				pre,
				validation,
				secondaryValidations,
				preRequest : {
					body,
					params,
					query,
					user,
					headers,
					pre : {},
				},
			});
			// There is a minor posibility where we do not need of validation
			// like when we are fetching list of records, where no pagination
			// involved or anything else we need from body, params or query
			// We can pass null or nothing for the validation part and it will
			// skip the entire validation section.
			if (validation) {
				xacml.validateRequest(req);
				if (xacml.validationErrors.length) {
					return res.withValidation(xacml.validationErrors);
				}
			}

			// This will make sure the pre methods assigned
			// and also that they are validated against our
			// secondaryValidations.
			if ((pre || []).length) {
				const xacmlRequest = await (await xacml.fetchPre()).validatePre();
				if (!xacmlRequest.preValidations.valid) {
					throw {
						status : 400,
						message : transform(xacml.preValidations.stack || "", "en"),
						stack : xacmlRequest.preValidations.stack,
					};
				}

				req.pre = xacmlRequest.preRequest.pre;
			}

			return next();
		} catch (error) {
			return res.withError("IDENTIFIER_REQUIRED", 400, error);
		}
	};
