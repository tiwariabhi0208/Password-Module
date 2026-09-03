/**
 * Derives two values from the master password:
 * 1. masterKey (ArrayBuffer, 32 bytes) -- stays in browser memory, used to encrypt vault data
 * 2. loginHashHex (string, 64 hex chars) -- sent to server for authentication
 *
 * @param {string} masterPassword - The raw password the user typed
 * @param {string} serverSaltHex - A hex string from GET /api/v1/auth/salt/?email=...
 *                                  The salt is unique per user, stored plaintext in DB.
 *                                  It does not need to be secret, only unique.
 */
export async function deriveKeyAndHash(masterPassword, serverSaltHex) {
  const enc = new TextEncoder();

  // Step 1: Convert the hex salt string into a byte array
  // The server sends the salt as a hex string like "a3f0b2c1..." (32 chars = 16 bytes)
  // We convert each two-character hex pair into a byte: "a3" -> 163
  const salt = new Uint8Array(
    serverSaltHex.match(/.{1,2}/g).map(b => parseInt(b, 16))
  );

  // Step 2: Import the raw password string as a PBKDF2 key object
  // extractable: false -- the password material cannot be read back out
  // Only allowed operations: deriveKey and deriveBits
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(masterPassword),  // Convert the password string to bytes
    "PBKDF2",
    false,                        // NOT extractable -- cannot be read back as raw bytes
    ["deriveKey", "deriveBits"]  // The only operations this key can be used for
  );

  // Step 3: Run PBKDF2 for 600,000 iterations to produce 64 bytes (512 bits)
  // 600,000 is the OWASP 2023 minimum for PBKDF2-HMAC-SHA256
  // Each iteration adds ~100 microseconds of work, making brute force slow
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 600_000,  // Underscores are valid JS number separators (600000)
      hash: "SHA-256",
    },
    passwordKey,
    512  // Produce 512 bits = 64 bytes total
  );

  // Step 4: Split the 64 bytes into two 32-byte halves
  const masterKey = derivedBits.slice(0, 32);       // Bytes 0-31: stays in browser
  const loginHashBytes = derivedBits.slice(32, 64); // Bytes 32-63: sent to server

  // Step 5: Convert the login hash bytes to a hex string for transmission
  const loginHashHex = Array.from(new Uint8Array(loginHashBytes))
    .map(b => b.toString(16).padStart(2, '0'))  // Each byte -> two hex chars
    .join('');

  // masterKey is an ArrayBuffer. Store it in a module-level variable or React ref.
  // NEVER put it in localStorage or a regular React state variable that logs to console.
  return { masterKey, loginHashHex };
}


/**
 * Encrypts a plaintext string using AES-256-GCM.
 *
 * @param {string} plaintext - The value to encrypt (e.g., "SBI123456789")
 * @param {ArrayBuffer} masterKey - The 32-byte master encryption key from deriveKeyAndHash()
 * @returns {Promise<string>} A base64 string containing: [12-byte IV] + [ciphertext + 16-byte auth tag]
 */
export async function encryptData(plaintext, masterKey) {
  const enc = new TextEncoder();

  // Generate a fresh, random 12-byte IV for every encryption operation.
  // CRITICAL: Reusing the same IV with the same key in AES-GCM is catastrophic.
  // Two ciphertexts with the same key+IV can be XORed to cancel the keystream,
  // potentially revealing both plaintexts. crypto.getRandomValues() uses the OS
  // entropy source (not Math.random) -- it is cryptographically random.
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96 bits = 12 bytes

  // Import the raw key bytes as a CryptoKey object for the encrypt operation
  const keyObj = await window.crypto.subtle.importKey(
    "raw",
    masterKey,
    "AES-GCM",
    false,        // NOT extractable
    ["encrypt"]   // Only allow encryption with this key object instance
  );

  // Perform the encryption -- produces ciphertext + 16-byte auth tag concatenated
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    keyObj,
    enc.encode(plaintext)  // Convert string to bytes before encrypting
  );

  // Prepend the IV to the ciphertext.
  // The IV is NOT secret -- it is safe to store alongside the ciphertext.
  // Prepending it creates a self-contained blob: everything needed for decryption
  // (except the key, which never leaves the browser) is in this one value.
  const combined = new Uint8Array(iv.byteLength + ciphertextBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertextBuffer), iv.byteLength);

  // Encode to base64 so it can be stored in the database as text
  return uint8ArrayToBase64(combined);
}


/**
 * Decrypts a base64-encoded AES-256-GCM ciphertext.
 *
 * @param {string} base64Ciphertext - The base64 string from the database
 * @param {ArrayBuffer} masterKey - The same 32-byte key used during encryption
 * @returns {Promise<string>} The original plaintext string
 *
 * If the ciphertext was tampered with, this will throw a DOMException.
 * ALWAYS catch errors from this function -- a thrown error means data corruption or tampering.
 */
export async function decryptData(base64Ciphertext, masterKey) {
  // Decode the base64 string back into bytes
  const data = Uint8Array.from(atob(base64Ciphertext), c => c.charCodeAt(0));

  // Extract the first 12 bytes (the IV that was prepended during encryption)
  const iv = data.slice(0, 12);

  // The rest is the actual ciphertext + auth tag
  const ciphertext = data.slice(12);

  // Import the key for the decrypt operation
  const keyObj = await window.crypto.subtle.importKey(
    "raw",
    masterKey,
    "AES-GCM",
    false,
    ["decrypt"]
  );

  // Decrypt -- this will throw if the auth tag does not match (tampering detected)
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    keyObj,
    ciphertext
  );

  // Convert the decrypted bytes back to a string
  return new TextDecoder().decode(decryptedBuffer);
}


/**
 * Safely converts a Uint8Array to a base64 string.
 *
 * WHY NOT `btoa(String.fromCharCode.apply(null, bytes))`?
 * The naive approach uses Function.prototype.apply() to spread the entire array
 * as arguments. JavaScript engines have a stack size limit on how many arguments
 * a function can receive. For arrays larger than ~65,000 elements (65KB), this
 * throws "Maximum call stack size exceeded" and silently fails.
 * A bank credential record with a photo could easily exceed this.
 *
 * This implementation processes the array in 8KB chunks to avoid the stack limit.
 */
function uint8ArrayToBase64(bytes) {
  let binary = '';
  const chunkSize = 8192; // 8KB chunks
  for (let i = 0; i < bytes.length; i += chunkSize) {
    // subarray() returns a view (no copy) -- efficient for large arrays
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToArrayBuffer(hexString) {
  if (!hexString) return new ArrayBuffer(0);
  const pairs = hexString.match(/.{1,2}/g);
  if (!pairs) return new ArrayBuffer(0);
  const bytes = new Uint8Array(pairs.map(byte => parseInt(byte, 16)));
  return bytes.buffer;
}

export async function hashPasswordSHA256(password) {
  if (!password) return "";
  const enc = new TextEncoder();
  const msgBuffer = enc.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generates a 256-bit cryptographically secure Recovery Key string.
 * Format: 24 uppercase hexadecimal characters grouped in 4-char chunks (e.g. "A3F8-99B2-4C1E-77D0-55FA-1234")
 */
export function generateRecoveryKey() {
  const bytes = new Uint8Array(12);
  window.crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return hex.match(/.{1,4}/g).join('-');
}

/**
 * Derives a 32-byte master key from a Recovery Key string.
 */
export async function deriveRecoveryMasterKey(recoveryKeyString) {
  const cleanHex = recoveryKeyString.replace(/[^a-fA-F0-9]/g, '');
  if (!cleanHex) throw new Error("Invalid Recovery Key format.");

  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(cleanHex),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const salt = enc.encode("vault-rescue-kit-salt-2026");
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100_000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );

  return derivedBits;
}

/**
 * Encrypts a vaultKey ArrayBuffer using a Recovery Key string.
 */
export async function encryptVaultKeyWithRecoveryKey(vaultKeyBuffer, recoveryKeyString) {
  const recoveryMasterKey = await deriveRecoveryMasterKey(recoveryKeyString);
  const hexVaultKey = arrayBufferToHex(vaultKeyBuffer);
  return await encryptData(hexVaultKey, recoveryMasterKey);
}

/**
 * Decrypts a base64-encoded recovery_encrypted_vault_key using a Recovery Key string.
 * Returns the raw vaultKey ArrayBuffer.
 */
export async function decryptVaultKeyWithRecoveryKey(base64Ciphertext, recoveryKeyString) {
  const recoveryMasterKey = await deriveRecoveryMasterKey(recoveryKeyString);
  const hexVaultKey = await decryptData(base64Ciphertext, recoveryMasterKey);
  return hexToArrayBuffer(hexVaultKey);
}


