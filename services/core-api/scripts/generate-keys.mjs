// Prints a JWT_PRIVATE_KEY line for .env or a secret manager:  npm run keys:generate
// The key never touches disk here; copy the output where it belongs.
import { generateKeyPairSync } from 'node:crypto';

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

// One line, with "\n" escapes, so it fits in a .env file and in most CI secret fields.
console.log(`JWT_PRIVATE_KEY="${privateKey.trim().replace(/\n/g, '\\n')}"`);
