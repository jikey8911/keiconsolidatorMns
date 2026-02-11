import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzeWallet } from "./analysisService";

// Mock the services
vi.mock("./covalentService", () => ({
  fetchTokenBalances: vi.fn(),
  fetchNativeBalance: vi.fn(),
  getSupportedChains: vi.fn(),
  getNativeCurrencySymbol: vi.fn(),
}));

vi.mock("./coingeckoService", () => ({
  fetchTokenPrices: vi.fn(),
  mapSymbolToCoinGeckoId: vi.fn(),
}));

vi.mock("../crypto", () => ({
  encryptValue: vi.fn(),
  decryptValue: vi.fn(),
  isValidEncryptedPackage: vi.fn(),
}));

vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

describe("analyzeWallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error when API keys are not configured", async () => {
    const { getDb } = await import("../db");
    vi.mocked(getDb).mockResolvedValue(null);

    await expect(analyzeWallet("0x1234567890123456789012345678901234567890")).rejects.toThrow(
      "API keys not configured"
    );
  });

  it("should return result with empty networks when no funds are found", async () => {
    const { getDb } = await import("../db");
    const { getSupportedChains, fetchNativeBalance, fetchTokenBalances } =
      await import("./covalentService");
    const { fetchTokenPrices } = await import("./coingeckoService");
    const { decryptValue } = await import("../crypto");

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 1,
                covalentApiKeyEncrypted: "encrypted_key",
                coingeckoApiKeyEncrypted: "encrypted_key",
                isConfigured: 1,
              },
            ]),
          }),
        }),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);
    vi.mocked(decryptValue).mockReturnValue("test_api_key");
    vi.mocked(getSupportedChains).mockReturnValue([
      { id: 1, name: "Ethereum" },
      { id: 56, name: "BNB Smart Chain" },
    ]);

    vi.mocked(fetchNativeBalance).mockResolvedValue(null);
    vi.mocked(fetchTokenBalances).mockResolvedValue([]);
    vi.mocked(fetchTokenPrices).mockResolvedValue(new Map());

    const result = await analyzeWallet("0x1234567890123456789012345678901234567890");
    expect(result.address).toBe("0x1234567890123456789012345678901234567890");
    expect(result.networks).toEqual([]);
    expect(result.totalValueUSD).toBe(0);
  });
});
