import { NextFunction, Request, Response } from "express";
import { extractBearerToken, verifyAuthToken } from "../providers/jwt";
import User from "../models/User";

/**
 * Attaches the authenticated user to `req.user` when a valid bearer token
 * is presented. It never rejects by itself - protecting a route is the
 * job of the authorize middleware, so public routes stay untouched.
 */
export default async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
	try {
		const token = extractBearerToken(req);
		if (!token) {
			return next();
		}

		const payload = verifyAuthToken(token);
		const userId = Number(payload?.sub);
		if (!payload || !Number.isInteger(userId)) {
			return next();
		}

		const user = await User.query().select("id", "role", "email", "status").findById(userId);
		if (user) {
			req.user = user;
		}
		return next();
	} catch (error) {
		return next(error);
	}
};
