/**
 * API Routes for Keiconsolidator
 * Handles wallet analysis and admin configuration
 */

import { Router, Request, Response } from "express";
import type { ZodError } from "zod";
import { analyzeWallet } from "./services/analysisService";
import { isValidEthereumAddress, extractBearerToken, adminConfigSchema } from "./validators";
import { encryptValue, decryptValue } from "./crypto";
import { getDb } from "./db";
import { ENV } from "./_core/env";
import { systemConfig } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Master admin key - imported from environment
const MASTER_ADMIN_KEY = ENV.masterAdminKey;

/**
 * Middleware to verify admin authentication
 */
function verifyAdminAuth(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);

  if (!token || token !== MASTER_ADMIN_KEY) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing admin authentication token",
    });
  }

  next();
}

/**
 * GET /api/v1/analysis/:address
 * Analyze a wallet across multiple chains
 */
router.get("/analysis/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    // Validate address format
    if (!isValidEthereumAddress(address)) {
      return res.status(400).json({
        error: "Invalid wallet address format",
        message: "Please provide a valid Ethereum address (0x...)",
      });
    }

    // Perform analysis
    const result = await analyzeWallet(address);

    // Check if any funds were found
    if (result.networks.length === 0) {
      return res.status(404).json({
        message: "No assets found for this address",
        address,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Analysis error:", error);

    if (error instanceof Error && error.message.includes("API keys not configured")) {
      return res.status(503).json({
        error: "Service not configured",
        message: "API keys have not been configured yet. Please contact the administrator.",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while analyzing the wallet",
    });
  }
});

/**
 * POST /api/v1/admin/config
 * Save encrypted API keys to database
 */
router.post("/admin/config", verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { covalentApiKey, coingeckoApiKey } = req.body;

    // Validate input
    const validation = adminConfigSchema.safeParse({
      covalentApiKey,
      coingeckoApiKey,
    });

    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      return res.status(400).json({
        error: "Validation error",
        message: errorMessages,
      });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        error: "Database not available",
        message: "Cannot save configuration at this time",
      });
    }

    // Encrypt API keys
    const encryptedCovalent = encryptValue(covalentApiKey);
    const encryptedCoingecko = encryptValue(coingeckoApiKey);

    // Save to database using the correct column names
    await db
      .insert(systemConfig)
      .values({
        id: 1,
        covalentApiKeyEncrypted: encryptedCovalent,
        coingeckoApiKeyEncrypted: encryptedCoingecko,
        isConfigured: 1,
      })
      .onDuplicateKeyUpdate({
        set: {
          covalentApiKeyEncrypted: encryptedCovalent,
          coingeckoApiKeyEncrypted: encryptedCoingecko,
          isConfigured: 1,
        },
      });

    return res.status(200).json({
      success: true,
      message: "API keys saved successfully",
    });
  } catch (error) {
    console.error("Config error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while saving configuration",
    });
  }
});

/**
 * GET /api/v1/admin/config/status
 * Check if system is configured
 */
router.get("/admin/config/status", verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        error: "Database not available",
        message: "Cannot check configuration status at this time",
      });
    }

    const config = await db.select().from(systemConfig).where(eq(systemConfig.id, 1)).limit(1);

    const isConfigured = config.length > 0 && config[0].isConfigured === 1;

    return res.status(200).json({
      isConfigured,
      message: isConfigured ? "System is configured" : "System needs configuration",
    });
  } catch (error) {
    console.error("Status check error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while checking configuration status",
    });
  }
});

/**
 * GET /api/v1/health
 * Health check endpoint
 */
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "Keiconsolidator API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
