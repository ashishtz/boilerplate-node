/* eslint-disable no-console -- CLI script, console is the intended output channel. */
import { generateKeyPair } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { authConfig } from "../src/config";

const generateKeyPairAsync = promisify(generateKeyPair);

const resolveFromCwd = (keyPath: string): string =>
	path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);

const fileExists = async (filePath: string): Promise<boolean> => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};

/**
 * Generates the RSA key pair used to sign and verify authentication
 * tokens. Refuses to overwrite existing keys unless --force is passed,
 * because replacing them invalidates every token already issued.
 */
const main = async (): Promise<void> => {
	const force = process.argv.includes("--force");
	const privateKeyPath = resolveFromCwd(authConfig.privateKeyPath);
	const publicKeyPath = resolveFromCwd(authConfig.publicKeyPath);

	if (!force && ((await fileExists(privateKeyPath)) || (await fileExists(publicKeyPath)))) {
		console.error(`Keys already exist at ${path.dirname(privateKeyPath)}. Re-run with --force to overwrite them.`);
		process.exitCode = 1;
		return;
	}

	const { publicKey, privateKey } = await generateKeyPairAsync("rsa", {
		modulusLength: 4096,
		publicKeyEncoding: { type: "spki", format: "pem" },
		privateKeyEncoding: {
			type: "pkcs8",
			format: "pem",
			cipher: "aes-256-cbc",
			passphrase: authConfig.jwtPassphrase,
		},
	});

	await fs.mkdir(path.dirname(privateKeyPath), { recursive: true });
	await fs.writeFile(privateKeyPath, privateKey, { mode: 0o600 });
	await fs.writeFile(publicKeyPath, publicKey, { mode: 0o644 });

	console.log(`Keys generated:\n  ${privateKeyPath}\n  ${publicKeyPath}`);
};

main().catch((error) => {
	console.error("Key generation failed:", error);
	process.exitCode = 1;
});
