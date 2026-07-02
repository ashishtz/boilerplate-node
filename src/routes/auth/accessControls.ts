import User from "../../models/User";
import type { AccessControlOptions } from "../../middlewares/xacml";

/**
 * XACML rules for the register endpoint: fetch any user holding the
 * requested email, then reject the request when one exists. The failing
 * check's name is the i18n code returned to the client.
 */
export const registerAccessControl: Pick<AccessControlOptions, "pre" | "secondaryValidations"> = {
	pre: [
		{
			assign: "userByEmail",
			method: (req) => User.query().findOne("email", String(req.body?.email ?? "")),
		},
	],
	secondaryValidations: [
		{
			assign: "EMAIL_ALREADY_EXISTS",
			method: (req) => !req.pre.userByEmail,
		},
	],
};
