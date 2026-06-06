// Generate an RSA-2048 (RS256) assertion signing key pair for issuing LINE
// "channel access token v2.1", per:
// https://developers.line.biz/en/docs/messaging-api/generate-json-web-token/#generate-a-key-pair-for-the-assertion-signing-key
//
// LINE requires: kty=RSA, 2048-bit, alg=RS256, use=sig. The PUBLIC key must NOT
// contain a `kid` — LINE issues the kid only when you register the public key
// in the LINE Developers Console.
//
// Usage:
//   node scripts/generate-assertion-key.mjs <private-key-output-path>
//
// - Prints the PUBLIC key JWK to stdout (safe to display; this is what you
//   register in the console).
// - Writes the PUBLIC key JWK to infra/assertion-public-key.jwk.json (safe to commit).
// - Writes the PRIVATE key JWK to <private-key-output-path> (mode 0600); the
//   caller is responsible for storing it securely (e.g. encrypted Pulumi config).

import { generateKeyPairSync } from "node:crypto";
import { writeFileSync } from "node:fs";

const outPrivate = process.argv[2];
if (!outPrivate) {
  console.error("usage: node scripts/generate-assertion-key.mjs <private-key-output-path>");
  process.exit(1);
}

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const priv = privateKey.export({ format: "jwk" });
const pub = publicKey.export({ format: "jwk" });

for (const jwk of [priv, pub]) {
  jwk.alg = "RS256";
  jwk.use = "sig";
  delete jwk.kid; // must be absent when registering the public key
}

writeFileSync(outPrivate, JSON.stringify(priv), { mode: 0o600 });
writeFileSync(
  new URL("../infra/assertion-public-key.jwk.json", import.meta.url),
  `${JSON.stringify(pub, null, 2)}\n`,
);

// Print ONLY the public key. Never print the private key.
console.log(JSON.stringify(pub, null, 2));
