import { NextFunction, Request, Response } from "express";
import Xacml from "./Xacml";
import type { AccessControlOptions } from "./types";

/**
 * Route middleware gluing the XACML phases together. Requests only reach
 * the service once every phase passed, keeping services focused on
 * business logic:
 *
 *   router.post(
 *     "/register",
 *     accessControl({ validation, pre, secondaryValidations }),
 *     registerService,
 *   );
 */
export default ({ pre = [], validation, secondaryValidations = [] }: AccessControlOptions = {}) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const xacml = new Xacml({
				pre,
				validation,
				secondaryValidations,
				preRequest: {
					body: req.body,
					params: req.params,
					query: req.query,
					user: req.user,
					headers: req.headers,
					pre: {},
				},
			});

			// Validation is optional: list endpoints without input can skip it.
			if (validation) {
				xacml.validateRequest();
				if (xacml.validationErrors.length) {
					return res.withValidation(xacml.validationErrors);
				}
			}

			if (pre.length || secondaryValidations.length) {
				await xacml.fetchPre();
				const result = await xacml.validatePre();
				if (!result.valid) {
					// The failing check's name doubles as the i18n message code.
					return res.withError(result.failedCheck ?? "BAD_REQUEST", 400);
				}
				req.pre = xacml.preRequest.pre;
			}

			return next();
		} catch (error) {
			return next(error);
		}
	};
