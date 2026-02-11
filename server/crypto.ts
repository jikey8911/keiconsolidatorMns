import crypto from "crypto";

/**
 * Encryption module for securing API keys
 * Uses AES-256-GCM for authenticated encryption
 */

// Master encryption key - should be stored in environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-insecure-key-change-in-production-32chars!!";

// Ensure key is 32 bytes (256 bits) for AES-256
const getEncryptionKey = (): Buffer => {
  const key = ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32);
  return Buffer.from(key);
};

/**
 * Encrypt a string value using AES-256-GCM
 * Returns a JSON string containing iv, authTag, and encryptedData
 */
export function encryptValue(plaintext: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    const encryptedPackage = {
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
      encryptedData: encrypted,
    };

    return JSON.stringify(encryptedPackage);
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt value");
  }
}

/**
 * Decrypt a string value encrypted with encryptValue
 * Expects a JSON string containing iv, authTag, and encryptedData
 */
export function decryptValue(encryptedPackage: string): string {
  try {
    const { iv, authTag, encryptedData } = JSON.parse(encryptedPackage);

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt value");
  }
}

/**
 * Verify if a string is a valid encrypted package
 */
export function isValidEncryptedPackage(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    return (
      parsed.iv &&
      parsed.authTag &&
      parsed.encryptedData &&
      typeof parsed.iv === "string" &&
      typeof parsed.authTag === "string" &&
      typeof parsed.encryptedData === "string"
    );
  } catch {
    return false;
  }
}
