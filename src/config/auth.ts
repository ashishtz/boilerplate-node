export default {
	authTokenExpiry : process.env.AUTH_TOKEN_EXPIRY || "7d",
	rememberTokenExpiry : process.env.REMEMBER_TOKEN_EXPIRY || "50d",
	jwtPassphrase : process.env.JWT_PASSPHRASE || "",
	appRoles : ["admin", "hr", "interviewer"],
	mailTokenSecret : process.env.MAIL_TOKEN_SECRET || "TestSecret",
	passwordsaltRound : 10,
	jwtTokenExpire : "30d",
};
