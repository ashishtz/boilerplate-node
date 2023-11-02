export default {
	allowedHosts : (process.env.ALLOWED_HOSTS || "localhost").split(","),
	serverUrl : process.env.SERVER_URL || "http://localhost:4200",
	enableLogging : !!process.env.ENABLE_LOGGING || false,
	enableQueryLogging : !!process.env.ENABLE_QUEry_LOG || false,
	getBaseUrlFromUrl : (url = "") => {
		const pathArray = url.split("/");
		const protocol = pathArray[0];
		const host = pathArray[2];
		return `${protocol}//${host}`;
	},
	mailVerificationLink : "verify-email",
};
