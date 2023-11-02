import { auth } from "../../config";
import jwt from "jsonwebtoken";

export const generateToken = (details: object, expiresIn = "2d") => {
	return jwt.sign(details, auth.mailTokenSecret, { expiresIn });
};

export const decodeToken = (token: string) => {
	try {
		const decode = jwt.verify(token, auth.mailTokenSecret);
		return decode;
	} catch (_err) {
		return null;
	}
};
