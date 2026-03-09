/**
 * Wallet Analysis Service
 * Orchestrates the analysis of wallet balances across multiple chains
 * Uses only Covalent API for both balances and prices
 */

import {
  fetchTokenBalances,
  fetchNativeBalance,
  getSupportedChains,
  getNativeCurrencySymbol,
} from "./covalentService";
import { decryptValue } from "../crypto";
import { getDb } from "../db";
import { systemConfig } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface Token {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  decimals: number;
  valueUSD: number;
}

export interface NetworkAnalysis {
  networkName: string;
  chainId: number;
  totalValueUSD: number;
  nativeCurrency: {
    symbol: string;
    balance: string;
    valueUSD: number;
  };
  tokens: Token[];
}

export interface WalletAnalysisResult {
  address: string;
  totalValueUSD: number;
  networks: NetworkAnalysis[];
}

/**
 * Get Covalent API key from encrypted database
 */
async function getApiKeys(): Promise<{ covalent: string } | null> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database not available");
      return null;
    }

    const config = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.id, 1))
      .limit(1);

    if (!config || config.length === 0) {
      console.log("No configuration found in database");
      return null;
    }

    const configRecord = config[0];

    if (!configRecord.covalentApiKeyEncrypted) {
      console.log("Covalent API key not configured");
      return null;
    }

    try {
      const covalentKey = decryptValue(configRecord.covalentApiKeyEncrypted);

      return {
        covalent: covalentKey,
      };
    } catch (error) {
      console.error("Failed to decrypt API key:", error);
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch API keys:", error);
    return null;
  }
}

/**
 * Analyze a wallet across all supported chains
 * Uses Covalent API for both balance and price data
 */
export async function analyzeWallet(address: string): Promise<WalletAnalysisResult> {
  const apiKeys = await getApiKeys();

  if (!apiKeys) {
    throw new Error(
      "API keys not configured. Please configure the Covalent API key in the admin panel."
    );
  }

  const chains = getSupportedChains();
  const networkAnalyses: NetworkAnalysis[] = [];

  // Fetch balances from all chains
  for (const chain of chains) {
    const nativeBalance = await fetchNativeBalance(address, chain.id, apiKeys.covalent);
    const tokens = await fetchTokenBalances(address, chain.id, apiKeys.covalent);

    let networkTotalUSD = 0;

    // Process native currency
    let nativeCurrencyData = {
      symbol: getNativeCurrencySymbol(chain.id),
      balance: "0",
      valueUSD: 0,
    };

    if (nativeBalance) {
      nativeCurrencyData = {
        symbol: getNativeCurrencySymbol(chain.id),
        balance: nativeBalance.balance,
        valueUSD: nativeBalance.valueUSD,
      };

      networkTotalUSD += nativeBalance.valueUSD;
    }

    // Process tokens - Covalent already provides USD values
    const processedTokens: Token[] = [];
    for (const token of tokens) {
      if (token.valueUSD > 0) {
        // Only include tokens with value
        processedTokens.push(token);
        networkTotalUSD += token.valueUSD;
      }
    }

    // Only include networks with value
    if (networkTotalUSD > 0 || nativeCurrencyData.valueUSD > 0) {
      networkAnalyses.push({
        networkName: chain.name,
        chainId: chain.id,
        totalValueUSD: networkTotalUSD,
        nativeCurrency: nativeCurrencyData,
        tokens: processedTokens,
      });
    }
  }

  // Calculate total value
  const totalValueUSD = networkAnalyses.reduce((sum, network) => sum + network.totalValueUSD, 0);

  return {
    address,
    totalValueUSD,
    networks: networkAnalyses,
  };
}
