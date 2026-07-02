import fs from "node:fs";
import path from "node:path";
import type { Request } from "express";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { authConfig } from "../config";
import type { Role } from "../constants";

export interface AuthTokenPayload extends JwtPayload {
	sub: string;
	role: Role;
}

const resolveKeyPath = (keyPath: string): string =>
	path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);

// Keys are loaded lazily and cached so that commands which never touch
// JWTs (migrations, key generation itself, tests) do not require the key
// files to exist at import time.
let privateKey: Buffer | null = null;
let publicKey: Buffer | null = null;

const loadKey = (keyPath: string, kind: "private" | "public"): Buffer => {
	const absolutePath = resolveKeyPath(keyPath);
	try {
		return fs.readFileSync(absolutePath);
	} catch (cause) {
		throw new Error(`Unable to read the JWT ${kind} key at "${absolutePath}". Run "npm run generate:keys" first.`, {
			cause,
		});
	}
};

const getPrivateKey = (): Buffer => (privateKey ??= loadKey(authConfig.privateKeyPath, "private"));
const getPublicKey = (): Buffer => (publicKey ??= loadKey(authConfig.publicKeyPath, "public"));

/**
 * Signs an authentication token with a minimal claim set: the user id as
 * the standard `sub` claim plus the role. Never place sensitive data in
 * the payload - it is readable by anyone holding the token.
 */
export const signAuthToken = (user: { id: number; role: Role }, rememberMe = false): string => {
	const expiresIn = rememberMe ? authConfig.rememberTokenExpiry : authConfig.authTokenExpiry;

	return jwt.sign(
		{ role: user.role },
		{ key: getPrivateKey(), passphrase: authConfig.jwtPassphrase },
		{
			algorithm: "RS256",
			subject: String(user.id),
			expiresIn: expiresIn as SignOptions["expiresIn"],
		},
	);
};

/** Returns the decoded payload, or null for a missing/invalid/expired token. */
export const verifyAuthToken = (token: string): AuthTokenPayload | null => {
	if (!token) {
		return null;
	}
	try {
		// Restricting the accepted algorithms prevents algorithm-confusion attacks.
		return jwt.verify(token, getPublicKey(), { algorithms: ["RS256"] }) as AuthTokenPayload;
	} catch {
		return null;
	}
};

/**
 * Extracts a bearer token from the Authorization header. Tokens are only
 * accepted from the header (never the query string) so they cannot leak
 * into access logs or browser history.
 */
export const extractBearerToken = (req: Request): string | null => {
	const header = req.headers.authorization;
	if (!header) {
		return null;
	}
	const [scheme, token] = header.split(" ");
	return scheme === "Bearer" && token ? token : null;
};
