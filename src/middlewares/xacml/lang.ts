const languages: {
	en: {
		[key: string]: string;
	};
} = { en: {} };

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
