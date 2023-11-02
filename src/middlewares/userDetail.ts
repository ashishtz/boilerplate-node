import { NextFunction, Request, Response } from "express";
import { validateJwt, findJwt } from "../providers/jwt";
import User from "../models/User";
import { JwtPayload } from "jsonwebtoken";

export default async (req: Request, _res: Response, next: NextFunction) => {
	const token = findJwt(req);
	if (token) {
		const decoded = validateJwt(token) as JwtPayload;
		if (decoded?.data?.id) {
			const user = await User.query().select("id", "role", "email", "status").findById(decoded.data.id);
			if (user) {
				req.user = user;
			}
		}
	}

	return next();
};
