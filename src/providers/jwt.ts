import { Request } from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { auth } from "../config";

const keysPath = path.resolve(`${__dirname}/../../keys`);

const PRIVATE_KEY = fs.readFileSync(`${keysPath}/private-Key.key`);
const PUBLIC_KEY = fs.readFileSync(`${keysPath}/public-Key.pub`);

export const signJwt = (details: unknown = null, rememberMe = false) => {
	const expiresIn = rememberMe ? auth.rememberTokenExpiry : auth.authTokenExpiry;

	if (!details) {
		return null;
	}
	const token = jwt.sign(
		{ data: details },
		{
			key : PRIVATE_KEY,
			passphrase : auth.jwtPassphrase,
		},
		{
			algorithm : "RS256",
			expiresIn,
		}
	);
	return token;
};

export const validateJwt = (token = "") => {
	try {
		if (token) {
			return jwt.verify(token, PUBLIC_KEY);
		}
	} catch (err) {
		return null;
	}
};

export const findJwt = (req: Request) => {
	if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
		return req.headers.authorization.split(" ")[1] as string;
	} else if (req.query && req.query.token) {
		return req.query.token as string;
	}
	return null;
};

export const verify = async (token: string) => {
	return jwt.verify(token, PUBLIC_KEY);
};
