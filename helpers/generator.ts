import { generateKeyPair } from "crypto";
import fs from "fs";
import log from "../src/providers/log";
import { auth } from "../src/config";

generateKeyPair(
	"rsa",
	{
		modulusLength : 4096,
		publicKeyEncoding : {
			type : "spki",
			format : "pem",
		},
		privateKeyEncoding : {
			type : "pkcs8",
			format : "pem",
			cipher : "aes-256-cbc",
			passphrase : auth.jwtPassphrase,
		},
	},
	async (err, publicKey, privateKey) => {
		if (err) {
			throw err;
		}
		fs.appendFile(`${__dirname}/../keys/private-Key.key`, privateKey, function (err) {
			if (err) throw err;
			fs.appendFile(`${__dirname}/../keys/public-Key.pub`, publicKey, function (err) {
				if (err) throw err;
				log.info("Keys are generated");
			});
		});
	}
);
