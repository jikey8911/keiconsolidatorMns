import { describe, it, expect, beforeAll } from "vitest";
import { encryptValue, decryptValue } from "./crypto";

describe("Encryption/Decryption", () => {
  it("should encrypt and decrypt a value correctly", () => {
    const testValue = "cqt_rQxBpxmMwdqfJHcdDrDj9QPC4Q3B";
    
    // Encrypt the value
    const encrypted = encryptValue(testValue);
    
    // Verify it's encrypted (should not be the original value)
    expect(encrypted).not.toBe(testValue);
    expect(encrypted.length).toBeGreaterThan(0);
    
    // Decrypt and verify it matches original
    const decrypted = decryptValue(encrypted);
    expect(decrypted).toBe(testValue);
  });

  it("should handle multiple encryptions of the same value", () => {
    const testValue = "test-api-key-123";
    
    const encrypted1 = encryptValue(testValue);
    const encrypted2 = encryptValue(testValue);
    
    // Each encryption should be different (due to random IV)
    expect(encrypted1).not.toBe(encrypted2);
    
    // But both should decrypt to the same value
    expect(decryptValue(encrypted1)).toBe(testValue);
    expect(decryptValue(encrypted2)).toBe(testValue);
  });

  it("should throw error when decrypting corrupted data", () => {
    const corruptedData = "corrupted-encrypted-data";
    
    expect(() => {
      decryptValue(corruptedData);
    }).toThrow();
  });
});
