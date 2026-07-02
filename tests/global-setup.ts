import { generateKeyPairSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * Generates a throwaway RSA key pair for the JWT tests. Paths and the
 * passphrase must match the `test.env` block in vitest.config.ts.
 */
export default function setup(): void {
	const keysDir = path.resolve(process.cwd(), "tests/.tmp/keys");
	fs.mkdirSync(keysDir, { recursive: true });

	const { publicKey, privateKey } = generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: { type: "spki", format: "pem" },
		privateKeyEncoding: {
			type: "pkcs8",
			format: "pem",
			cipher: "aes-256-cbc",
			passphrase: "test-passphrase",
		},
	});

	fs.writeFileSync(path.join(keysDir, "private.pem"), privateKey, { mode: 0o600 });
	fs.writeFileSync(path.join(keysDir, "public.pem"), publicKey);
}
