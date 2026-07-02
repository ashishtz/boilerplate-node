import bcrypt from "bcrypt";
import { authConfig } from "../../config";

/**
 * Hashes a plain text password with bcrypt. Async on purpose: the sync
 * variants block the event loop for the full cost factor duration.
 */
export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, authConfig.bcryptSaltRounds);

/** Compares a plain text password against a stored bcrypt hash. */
export const verifyPassword = async (plain: string, hash: string): Promise<boolean> => {
	try {
		return await bcrypt.compare(plain, hash);
	} catch {
		return false;
	}
};
