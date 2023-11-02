import { auth } from "../../config";
import bcrypt from "bcrypt";

export const encryptPassword = (password: string) => {
	try {
		return bcrypt.hashSync(password, auth.passwordsaltRound);
	} catch (error) {
		return null;
	}
};

export const decryptPassword = (hashed: string, string: string) => {
	try {
		return bcrypt.compareSync(string, hashed);
	} catch (error) {
		return false;
	}
};
