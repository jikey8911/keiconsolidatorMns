/**
 * Wallet Analysis Service
 * Orchestrates the analysis of wallet balances across multiple chains
 */

import {
  fetchTokenBalances,
  fetchNativeBalance,
  getSupportedChains,
  getNativeCurrencySymbol,
} from "./covalentService";
import { mapSymbolToCoinGeckoId, fetchTokenPrices } from "./coingeckoService";
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
 * Get API keys from encrypted database
 */
async function getApiKeys(): Promise<{ covalent: string; coingecko: string } | null> {
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

    if (!configRecord.covalentApiKeyEncrypted || !configRecord.coingeckoApiKeyEncrypted) {
      console.log("API keys not configured");
      return null;
    }

    try {
      const covalentKey = decryptValue(configRecord.covalentApiKeyEncrypted);
      const coingeckoKey = decryptValue(configRecord.coingeckoApiKeyEncrypted);

      return {
        covalent: covalentKey,
        coingecko: coingeckoKey,
      };
    } catch (error) {
      console.error("Failed to decrypt API keys:", error);
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch API keys:", error);
    return null;
  }
}

/**
 * Analyze a wallet across all supported chains
 */
export async function analyzeWallet(address: string): Promise<WalletAnalysisResult> {
  const apiKeys = await getApiKeys();

  if (!apiKeys) {
    throw new Error(
      "API keys not configured. Please configure Covalent and CoinGecko keys in the admin panel."
    );
  }

  const chains = getSupportedChains();
  const networkAnalyses: NetworkAnalysis[] = [];
  const allTokenIds = new Set<string>();

  // Fetch balances from all chains
  const chainBalances: Array<{
    chainId: number;
    nativeBalance: { balance: string; valueUSD: number } | null;
    tokens: Token[];
  }> = [];

  for (const chain of chains) {
    const nativeBalance = await fetchNativeBalance(address, chain.id, apiKeys.covalent);
    const tokens = await fetchTokenBalances(address, chain.id, apiKeys.covalent);

    chainBalances.push({
      chainId: chain.id,
      nativeBalance,
      tokens,
    });

    // Collect token IDs for price fetching
    if (nativeBalance) {
      const nativeSymbol = getNativeCurrencySymbol(chain.id);
      const coinGeckoId = mapSymbolToCoinGeckoId(nativeSymbol);
      allTokenIds.add(coinGeckoId);
    }

    tokens.forEach((token) => {
      const coinGeckoId = mapSymbolToCoinGeckoId(token.symbol);
      allTokenIds.add(coinGeckoId);
    });
  }

  // Fetch all prices at once
  const tokenPrices = await fetchTokenPrices(Array.from(allTokenIds), apiKeys.coingecko);

  // Build network analyses
  let totalValueUSD = 0;

  for (let i = 0; i < chains.length; i++) {
    const chain = chains[i];
    const balances = chainBalances[i];

    if (!balances) continue;

    let networkTotalUSD = 0;

    // Process native currency
    let nativeCurrencyData = {
      symbol: getNativeCurrencySymbol(chain.id),
      balance: "0",
      valueUSD: 0,
    };

    if (balances.nativeBalance) {
      const nativeSymbol = getNativeCurrencySymbol(chain.id);
      const coinGeckoId = mapSymbolToCoinGeckoId(nativeSymbol);
      const price = tokenPrices.get(coinGeckoId) || 0;
      const valueUSD = parseFloat(balances.nativeBalance.balance) * price;

      nativeCurrencyData = {
        symbol: nativeSymbol,
        balance: balances.nativeBalance.balance,
        valueUSD,
      };

      networkTotalUSD += valueUSD;
    }

    // Process tokens
    const processedTokens: Token[] = [];
    for (const token of balances.tokens) {
      const coinGeckoId = mapSymbolToCoinGeckoId(token.symbol);
      const price = tokenPrices.get(coinGeckoId) || 0;
      const valueUSD = parseFloat(token.balance) * price;

      if (valueUSD > 0) {
        // Only include tokens with value
        processedTokens.push({
          ...token,
          valueUSD,
        });

        networkTotalUSD += valueUSD;
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

      totalValueUSD += networkTotalUSD;
    }
  }

  return {
    address,
    totalValueUSD,
    networks: networkAnalyses,
  };
}
