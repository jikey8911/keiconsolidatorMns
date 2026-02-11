import { describe, it, expect } from "vitest";
import {
  isValidEthereumAddress,
  extractBearerToken,
  ethereumAddressSchema,
  adminConfigSchema,
} from "./validators";

describe("Validators", () => {
  describe("Ethereum Address Validation", () => {
    it("should validate correct Ethereum address", () => {
      const validAddress = "0x1234567890123456789012345678901234567890";
      expect(isValidEthereumAddress(validAddress)).toBe(true);
    });

    it("should reject address without 0x prefix", () => {
      const invalidAddress = "1234567890123456789012345678901234567890";
      expect(isValidEthereumAddress(invalidAddress)).toBe(false);
    });

    it("should reject address with invalid length", () => {
      const invalidAddress = "0x123456789012345678901234567890123456789";
      expect(isValidEthereumAddress(invalidAddress)).toBe(false);
    });

    it("should reject address with non-hex characters", () => {
      const invalidAddress = "0xZZZZ567890123456789012345678901234567890";
      expect(isValidEthereumAddress(invalidAddress)).toBe(false);
    });

    it("should accept uppercase and lowercase hex characters", () => {
      const address1 = "0xABCDEF1234567890ABCDEF1234567890ABCDEF12";
      const address2 = "0xabcdef1234567890abcdef1234567890abcdef12";
      expect(isValidEthereumAddress(address1)).toBe(true);
      expect(isValidEthereumAddress(address2)).toBe(true);
    });
  });

  describe("Bearer Token Extraction", () => {
    it("should extract valid bearer token", () => {
      const authHeader = "Bearer my_secret_token_123";
      const token = extractBearerToken(authHeader);
      expect(token).toBe("my_secret_token_123");
    });

    it("should return null for missing authorization header", () => {
      const token = extractBearerToken(undefined);
      expect(token).toBeNull();
    });

    it("should return null for invalid bearer format", () => {
      const authHeader = "Basic my_secret_token_123";
      const token = extractBearerToken(authHeader);
      expect(token).toBeNull();
    });

    it("should return null for empty bearer token", () => {
      const authHeader = "Bearer ";
      const token = extractBearerToken(authHeader);
      expect(token).toBeNull();
    });
  });

  describe("Admin Config Validation", () => {
    it("should validate correct admin config", () => {
      const config = {
        covalentApiKey: "cqt_1234567890abcdef",
        coingeckoApiKey: "CG_1234567890abcdef",
      };
      const result = adminConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("should reject config with missing covalent key", () => {
      const config = {
        coingeckoApiKey: "CG_1234567890abcdef",
      };
      const result = adminConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it("should reject config with short API keys", () => {
      const config = {
        covalentApiKey: "short",
        coingeckoApiKey: "key",
      };
      const result = adminConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it("should reject config with empty strings", () => {
      const config = {
        covalentApiKey: "",
        coingeckoApiKey: "",
      };
      const result = adminConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });
});
