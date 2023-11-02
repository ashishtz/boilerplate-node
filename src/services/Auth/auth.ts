import { Request, Response } from "express";
import { USER_NOT_FOUND, constant } from "../../config";
import { User } from "../../models";
import { decryptPassword } from "../../tokens";
import { signJwt } from "../../providers/jwt";

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		const user = await User.query()
			.select("id", "name", "email", "password", "role", "phone", "status")
			.where("email", email)
			.first();

		if (!user) throw USER_NOT_FOUND;

		const { password: passwordHash } = user;
		if (decryptPassword(passwordHash, password)) {
			if (user.status == constant.userStatusInactive) {
				// -----------------THIS WILL BE DONE WHEN I INTEGRATE THE MAIL SERVICES-----------------
				// const token = generateToken({ userId: user.id }, auth.jwtTokenExpire);
				// const link = app.getBaseUrlFromUrl(req.get("Referrer"));
				// const emailData = {
				// 	link : `${link}/${app.mailVerificationLink}/${token}`,
				// 	email : user.email,
				// };
			}
		}
		const token = signJwt({
			...user,
			userId : user.id,
			id : undefined,
			password : undefined,
		});

		if (token) {
			return res.withData(
				{
					token,
					loginDetails : {
						...user,
						userId : user.id,
						id : undefined,
						password : undefined,
					},
				},
				"SUCCESS",
				200
			);
		}
		return res.withError("INVALID_CREDENTIALS", 400);
	} catch (error) {
		return res.withError("GENERAL_ERROR", 404, error);
	}
};

