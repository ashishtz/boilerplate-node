import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { authConfig } from "../../config";

/**
 * Short lived, HMAC signed tokens for single purpose links such as email
 * verification or password reset. These are intentionally separate from
 * the RS256 authentication tokens issued at login.
 */
export const generateToken = (payload: object, expiresIn = "2d"): string =>
	jwt.sign(payload, authConfig.mailTokenSecret, { expiresIn: expiresIn as SignOptions["expiresIn"] });

/** Returns the decoded payload, or null for an invalid or expired token. */
export const decodeToken = <T extends object = JwtPayload>(token: string): (T & JwtPayload) | null => {
	try {
		return jwt.verify(token, authConfig.mailTokenSecret) as T & JwtPayload;
	} catch {
		return null;
	}
};
