import { z } from "zod";

/**
 * Validators for API endpoints
 */

// Ethereum address validation (0x followed by 40 hex characters)
export const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format");

// API key validation
export const apiKeySchema = z.string().min(10, "API key must be at least 10 characters");

// Admin configuration schema - Only Covalent API key required
export const adminConfigSchema = z.object({
  covalentApiKey: apiKeySchema,
});

export type AdminConfig = z.infer<typeof adminConfigSchema>;

// Bearer token validation
export const bearerTokenSchema = z
  .string()
  .refine((val) => val.startsWith("Bearer "), "Invalid bearer token format")
  .transform((val) => val.slice(7)) // Remove "Bearer " prefix
  .refine((val) => val.length > 0, "Bearer token cannot be empty");

/**
 * Validate Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  try {
    ethereumAddressSchema.parse(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract bearer token from authorization header
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;

  try {
    const token = bearerTokenSchema.parse(authHeader);
    return token.length > 0 ? token : null;
  } catch {
    return null;
  }
}
