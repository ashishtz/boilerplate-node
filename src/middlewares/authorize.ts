import { NextFunction, Request, Response } from "express";
import { Role, ROLES } from "../constants";

/**
 * Role based route guard. Requires the authenticate middleware to have
 * run earlier in the chain.
 *
 *   router.get("/admin-only", authorize("admin"), handler);
 *   router.get("/shared", authorize(["admin", "user"]), handler);
 */
export default (roles: Role | Role[]) => {
	const allowed = Array.isArray(roles) ? roles : [roles];

	// Misconfiguration is a programmer error: fail fast at startup instead
	// of returning confusing 500s per request.
	if (!allowed.length) {
		throw new Error("authorize() requires at least one role");
	}
	const invalid = allowed.filter((role) => !ROLES.includes(role));
	if (invalid.length) {
		throw new Error(`authorize() received unknown roles: ${invalid.join(", ")}`);
	}

	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.withError("NOT_AUTHENTICATED", 401);
		}
		if (!allowed.includes(req.user.role)) {
			return res.withError("NOT_AUTHORIZED", 403);
		}
		return next();
	};
};
