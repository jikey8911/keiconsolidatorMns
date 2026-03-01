import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Search, Loader2, Settings, Wallet, TrendingUp } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

/**
 * Analysis Page - Wallet Balance Analysis
 */
export default function AnalysisPage() {
  const { setCurrentPage, setMessage, walletAnalysis, setWalletAnalysis, isAnalyzing, setIsAnalyzing, currentWallet, setCurrentWallet } = useAppContext();
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate Ethereum address format
   */
  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  /**
   * Perform wallet analysis
   */
  const handleSearch = async () => {
    const address = searchInput.trim();

    if (!address) {
      setError("Please enter a wallet address");
      return;
    }

    if (!isValidAddress(address)) {
      setError("Invalid Ethereum address format. Must be 0x followed by 40 hex characters.");
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setCurrentWallet(address);

    try {
      const response = await fetch(`/api/v1/analysis/${address}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("No assets found for this wallet address");
          setWalletAnalysis(null);
        } else {
          setError("Failed to analyze wallet. Please try again.");
        }
        return;
      }

      const data = await response.json();
      setWalletAnalysis(data);
      setMessage({ type: "success", text: `Found ${data.networks.length} networks with assets` });
    } catch (err) {
      setError("Failed to connect to API. Please check your configuration.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Format large numbers for display
   */
  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(decimals)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(decimals)}K`;
    }
    return `$${num.toFixed(decimals)}`;
  };

  /**
   * Get chain color
   */
  const getChainColor = (chainId: number): string => {
    const colors: Record<number, string> = {
      1: "from-purple-600 to-purple-700",
      56: "from-yellow-600 to-yellow-700",
      137: "from-blue-600 to-blue-700",
      42161: "from-red-600 to-red-700",
    };
    return colors[chainId] || "from-slate-600 to-slate-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Wallet Analysis</h1>
            <p className="text-slate-400">Search for any Ethereum wallet to view balances across multiple chains</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage("config")}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </Button>
        </div>

        {/* Search Card */}
        <Card className="bg-slate-900 border-slate-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Search Wallet</CardTitle>
            <CardDescription>Enter an Ethereum address to analyze</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setError(null);
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                disabled={isAnalyzing}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
              />
              <Button
                onClick={handleSearch}
                disabled={isAnalyzing || !searchInput.trim()}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="flex items-gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {walletAnalysis && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Total Value</p>
                    <p className="text-3xl font-bold text-cyan-400">
                      {formatNumber(walletAnalysis.totalValueUSD)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Networks Found</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {walletAnalysis.networks.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Wallet Address</p>
                    <p className="text-sm font-mono text-slate-300 truncate">
                      {currentWallet}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Networks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {walletAnalysis.networks.map((network: any, idx: number) => (
                <Card key={idx} className="bg-slate-900 border-slate-800 overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${getChainColor(network.chainId)}`} />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-cyan-400" />
                          {network.networkName}
                        </CardTitle>
                        <CardDescription>Chain ID: {network.chainId}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-400 font-bold">{formatNumber(network.totalValueUSD)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Native Currency */}
                    <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-slate-200 font-medium">{network.nativeCurrency.symbol}</p>
                          <p className="text-slate-400 text-sm">{network.nativeCurrency.balance}</p>
                        </div>
                        <p className="text-cyan-400 font-bold">
                          {formatNumber(network.nativeCurrency.valueUSD)}
                        </p>
                      </div>
                    </div>

                    {/* Tokens */}
                    {network.tokens.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Tokens</p>
                        {network.tokens.slice(0, 3).map((token: any, tidx: number) => (
                          <div key={tidx} className="flex justify-between items-center text-sm">
                            <div>
                              <p className="text-slate-200">{token.symbol}</p>
                              <p className="text-slate-500 text-xs">{token.balance}</p>
                            </div>
                            <p className="text-blue-400 font-semibold">
                              {formatNumber(token.valueUSD)}
                            </p>
                          </div>
                        ))}
                        {network.tokens.length > 3 && (
                          <p className="text-slate-500 text-xs pt-2">
                            +{network.tokens.length - 3} more tokens
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Consolidation CTA */}
            {walletAnalysis.totalValueUSD > 0 && (
              <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        Ready to consolidate?
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Let our AI find the best way to consolidate your funds to a single wallet
                      </p>
                    </div>
                    <Button 
                      onClick={() => setCurrentPage("consolidation")}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                    >
                      Consolidate Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!walletAnalysis && !isAnalyzing && (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-12 pb-12 text-center">
              <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No wallet analyzed yet</p>
              <p className="text-slate-500 text-sm">Enter a wallet address above to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
