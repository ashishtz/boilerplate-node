const languages: {
	en: {
		[key: string]: string;
	};
} = {
	en : {
		NOT_AVAILABLE : "This service is not available",
		GENERAL_ERROR : "Oops! Something went wrong, Please try again.",
		INVALID_CREDENTIALS : "Invalid credentials provided. Please try again",
		NOT_AUTHENTICATED : "You are not authenticated to access this service",
		USER_NOT_FOUND : "User not found.",
		USER_ADDED : "User added successfully.",
	},
};

const transform = (message: string, lang: "en" = "en") => {
	if (languages[lang]) {
		if (languages[lang][message]) {
			return languages[lang][message];
		}
		if (languages.en[message]) {
			return languages.en[message];
		}
	} else if (languages.en[message]) {
		return languages.en[message];
	}
	return message;
};

export default transform;
