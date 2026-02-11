/**
 * CoinGecko API Service
 * Fetches token prices in USD
 */

interface CoinGeckoMarketData {
  [key: string]: {
    usd: number;
  };
}

/**
 * Fetch prices for multiple tokens from CoinGecko
 * @param tokenIds Array of CoinGecko token IDs (e.g., ["ethereum", "binancecoin"])
 * @param apiKey CoinGecko API key (optional for free tier)
 * @returns Map of token ID to USD price
 */
export async function fetchTokenPrices(
  tokenIds: string[],
  apiKey?: string
): Promise<Map<string, number>> {
  if (tokenIds.length === 0) {
    return new Map();
  }

  try {
    const uniqueIds = [...new Set(tokenIds)]; // Remove duplicates
    const idsParam = uniqueIds.join(",");

    let url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;

    if (apiKey) {
      url += `&x_cg_pro_api_key=${apiKey}`;
    }

    const response = await fetch(url);
    const data: CoinGeckoMarketData = await response.json();

    const priceMap = new Map<string, number>();

    for (const [tokenId, priceData] of Object.entries(data)) {
      if (priceData && priceData.usd) {
        priceMap.set(tokenId, priceData.usd);
      }
    }

    return priceMap;
  } catch (error) {
    console.error("Failed to fetch token prices from CoinGecko:", error);
    return new Map();
  }
}

/**
 * Map token symbols to CoinGecko IDs
 * This is a simplified mapping - in production, you'd want a more comprehensive list
 */
export function mapSymbolToCoinGeckoId(symbol: string): string {
  const symbolMap: Record<string, string> = {
    // Native currencies
    ETH: "ethereum",
    BNB: "binancecoin",
    MATIC: "matic-network",

    // Common tokens
    USDT: "tether",
    USDC: "usd-coin",
    CAKE: "pancakeswap-token",
    WETH: "weth",
    WBTC: "wrapped-bitcoin",
    DAI: "dai",
    LINK: "chainlink",
    AAVE: "aave",
    UNI: "uniswap",
    SUSHI: "sushi",
    CURVE: "curve-dao-token",
    CRV: "curve-dao-token",
    COMP: "compound-governance-token",
    YFI: "yearn-finance",
    LIDO: "lido-dao",
    LDO: "lido-dao",
    ARB: "arbitrum",
    OP: "optimism",
    GMX: "gmx",
    PENDLE: "pendle",
    BLUR: "blur",
    DYDX: "dydx",
    APTOS: "aptos",
    APT: "aptos",
    APE: "apecoin",
    SHIB: "shiba-inu",
    DOGE: "dogecoin",
    PEPE: "pepe",
  };

  return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
}

/**
 * Fetch price for a single token
 */
export async function fetchTokenPrice(
  tokenId: string,
  apiKey?: string
): Promise<number> {
  const prices = await fetchTokenPrices([tokenId], apiKey);
  return prices.get(tokenId) || 0;
}
