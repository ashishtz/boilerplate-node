import { Request, Response } from "express";
import { UniqueViolationError } from "objection";
import { ROLE, USER_STATUS } from "../../constants";
import { ApiError } from "../../errors";
import User from "../../models/User";
import { signAuthToken } from "../../providers/jwt";
import { hashPassword, verifyPassword } from "../../tokens";

/**
 * Authenticates a user by email and password and returns a bearer token.
 * Both "unknown email" and "wrong password" answer with the same 401 so
 * the endpoint cannot be used to enumerate registered email addresses.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
	const { email, password, rememberMe } = req.body as {
		email: string;
		password: string;
		rememberMe?: boolean;
	};

	const user = await User.query().findOne("email", email);
	if (!user) {
		throw ApiError.unauthorized("INVALID_CREDENTIALS");
	}

	const passwordValid = await verifyPassword(password, user.password);
	if (!passwordValid) {
		throw ApiError.unauthorized("INVALID_CREDENTIALS");
	}

	if (user.status === USER_STATUS.INACTIVE) {
		throw ApiError.forbidden("ACCOUNT_INACTIVE");
	}

	const token = signAuthToken(user, Boolean(rememberMe));

	// `user` is serialized through User.$formatJson, which strips the password hash.
	res.withData({ token, user }, "SUCCESS");
};

/**
 * Registers a new user. The XACML access control on the route has already
 * validated the payload and asserted the email is unused; the unique
 * constraint on the table covers the remaining race window.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
	const { name, email, password, phone } = req.body as {
		name: string;
		email: string;
		password: string;
		phone: string;
	};

	try {
		const user = await User.query().insertAndFetch({
			name,
			email,
			password: await hashPassword(password),
			phone,
			// Self-registration must never grant elevated privileges.
			role: ROLE.USER,
			// Swap to USER_STATUS.UNVERIFIED once an email verification flow exists.
			status: USER_STATUS.ACTIVE,
		});

		res.withData(user, "USER_ADDED", 201);
	} catch (error) {
		if (error instanceof UniqueViolationError) {
			throw ApiError.conflict("EMAIL_ALREADY_EXISTS");
		}
		throw error;
	}
};
