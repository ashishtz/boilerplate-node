import { NextFunction, Request, Response } from "express";
import { auth } from "../config";

type ValidRoleTypes = "admin" | "hr" | "interviewer";

export default (roles: ValidRoleTypes | ValidRoleTypes[] = []) =>
	async (req: Request, res: Response, next: NextFunction) => {
		if (!roles || !(roles || []).length) {
			return res.withError("The middleware does not have any role defined", 500);
		}
		const allRoles = typeof roles === "string" ? [roles] : roles;
		const allValid = allRoles.every((role) => auth.appRoles.includes(role));

		if (!allValid) {
			return res.withError("Middleware has some invalid roles", 500);
		}

		if (!req.user) {
			return res.withError("NOT_AUTHENTICATED", 401);
		}

		if (!allRoles.includes(req.user.role)) {
			return res.withError("NOT_AUTHORIZED", 403);
		}
		return next();
	};
