/**
 * Covalent API Service
 * Fetches token balances for a wallet across multiple chains
 */

interface CovalentToken {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  balance: string;
  quote: number | null;
  quote_rate: number | null;
}

interface CovalentResponse {
  data: {
    items: CovalentToken[];
  } | null;
  error: boolean;
  error_message: string | null;
}

interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  decimals: number;
  valueUSD: number;
}

const CHAIN_IDS = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  arbitrum: 42161,
};

const CHAIN_NAMES = {
  1: "Ethereum",
  56: "BNB Smart Chain",
  137: "Polygon",
  42161: "Arbitrum",
};

/**
 * Fetch token balances for a wallet on a specific chain
 */
export async function fetchTokenBalances(
  address: string,
  chainId: number,
  apiKey: string
): Promise<TokenBalance[]> {
  try {
    const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${apiKey}`;

    const response = await fetch(url);
    const data: CovalentResponse = await response.json();

    if (data.error || !data.data) {
      console.error(`Covalent error for chain ${chainId}:`, data.error_message);
      return [];
    }

    return data.data.items
      .filter((token) => {
        // Filter out tokens with zero balance and invalid data
        const balance = BigInt(token.balance || "0");
        return balance > 0n;
      })
      .map((token) => {
        const balance = BigInt(token.balance || "0");
        const divisor = BigInt(10) ** BigInt(token.contract_decimals);
        const humanReadableBalance = (Number(balance) / Number(divisor)).toString();

        return {
          symbol: token.contract_ticker_symbol || "UNKNOWN",
          name: token.contract_name || "Unknown Token",
          address: token.contract_address,
          balance: humanReadableBalance,
          decimals: token.contract_decimals,
          valueUSD: token.quote || 0,
        };
      });
  } catch (error) {
    console.error(`Failed to fetch balances for chain ${chainId}:`, error);
    return [];
  }
}

/**
 * Fetch native currency balance for a wallet on a specific chain
 */
export async function fetchNativeBalance(
  address: string,
  chainId: number,
  apiKey: string
): Promise<{ balance: string; valueUSD: number } | null> {
  try {
    const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balance_v2/?key=${apiKey}`;

    const response = await fetch(url);
    const data: any = await response.json();

    if (data.error || !data.data) {
      console.error(`Covalent native balance error for chain ${chainId}:`, data.error_message);
      return null;
    }

    const items = data.data.items || [];
    if (items.length === 0) return null;

    const nativeToken = items[0];
    const balance = BigInt(nativeToken.balance || "0");
    const divisor = BigInt(10) ** BigInt(nativeToken.contract_decimals || 18);
    const humanReadableBalance = (Number(balance) / Number(divisor)).toString();

    return {
      balance: humanReadableBalance,
      valueUSD: nativeToken.quote || 0,
    };
  } catch (error) {
    console.error(`Failed to fetch native balance for chain ${chainId}:`, error);
    return null;
  }
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChains(): Array<{
  id: number;
  name: string;
}> {
  return Object.entries(CHAIN_IDS).map(([name, id]) => ({
    id,
    name: CHAIN_NAMES[id as keyof typeof CHAIN_NAMES],
  }));
}

/**
 * Get native currency symbol for a chain
 */
export function getNativeCurrencySymbol(chainId: number): string {
  const symbols: Record<number, string> = {
    1: "ETH",
    56: "BNB",
    137: "MATIC",
    42161: "ETH",
  };
  return symbols[chainId] || "UNKNOWN";
}
