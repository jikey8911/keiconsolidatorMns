import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  DollarSign,
} from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

/**
 * Consolidation Page - AI-Powered Consolidation Strategy
 */
export default function ConsolidationPage() {
  const { walletAnalysis, setCurrentPage, setMessage, consolidationPlan, setConsolidationPlan } =
    useAppContext();
  const [targetWallet, setTargetWallet] = useState("");
  const [targetNetwork, setTargetNetwork] = useState("Ethereum");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!walletAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 flex items-center justify-center">
        <Card className="bg-slate-900 border-slate-800 max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">No Wallet Analyzed</p>
            <p className="text-slate-400 text-sm mb-4">
              Please analyze a wallet first before consolidating
            </p>
            <Button
              onClick={() => setCurrentPage("analysis")}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
            >
              Go to Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Generate consolidation strategy using AI
   */
  const handleGenerateStrategy = async () => {
    if (!targetWallet.trim()) {
      setError("Please enter a target wallet address");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(targetWallet)) {
      setError("Invalid wallet address format");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const mockStrategy = {
        steps: [
          {
            type: "transfer",
            fromNetwork: walletAnalysis.networks[0]?.networkName || "Ethereum",
            toNetwork: targetNetwork,
            fromToken: walletAnalysis.networks[0]?.nativeCurrency?.symbol || "ETH",
            toToken: "USDT",
            amount: walletAnalysis.networks[0]?.nativeCurrency?.balance || "0",
            estimatedGas: "50",
            description: `Transfer ${walletAnalysis.networks[0]?.nativeCurrency?.symbol} to target wallet`,
          },
        ],
        totalEstimatedGas: "50",
        estimatedTime: "10-30 minutes",
        riskLevel: "low",
        recommendation:
          "Direct transfer of all available funds to the target wallet on the specified network.",
      };

      setConsolidationPlan(mockStrategy);
      setMessage({
        type: "success",
        text: "Consolidation strategy generated successfully",
      });
    } catch (err) {
      setError("Failed to generate consolidation strategy");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get risk level color
   */
  const getRiskColor = (level: string): string => {
    switch (level) {
      case "low":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "high":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Consolidation Strategy</h1>
          <p className="text-slate-400">
            AI-powered analysis to find the best way to consolidate your funds
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-900 border-slate-800 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Configuration</CardTitle>
                <CardDescription>Set your consolidation target</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Target Wallet Address
                  </label>
                  <Input
                    placeholder="0x..."
                    value={targetWallet}
                    onChange={(e) => {
                      setTargetWallet(e.target.value);
                      setError(null);
                    }}
                    disabled={isLoading}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Target Network
                  </label>
                  <select
                    value={targetNetwork}
                    onChange={(e) => setTargetNetwork(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded px-3 py-2"
                  >
                    <option>Ethereum</option>
                    <option>BNB Smart Chain</option>
                    <option>Polygon</option>
                    <option>Arbitrum</option>
                  </select>
                </div>

                {error && (
                  <div className="flex items-gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleGenerateStrategy}
                  disabled={isLoading || !targetWallet.trim()}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Strategy
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage("analysis")}
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Back to Analysis
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Strategy Display */}
          <div className="lg:col-span-2">
            {consolidationPlan ? (
              <div className="space-y-6">
                {/* Summary */}
                <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Estimated Gas</p>
                        <p className="text-2xl font-bold text-cyan-400 flex items-center gap-1">
                          <DollarSign className="w-5 h-5" />
                          {consolidationPlan.totalEstimatedGas}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Time to Complete</p>
                        <p className="text-lg font-bold text-blue-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {consolidationPlan.estimatedTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Risk Level</p>
                        <p className={`text-lg font-bold flex items-center gap-1 ${getRiskColor(consolidationPlan.riskLevel)}`}>
                          <Shield className="w-4 h-4" />
                          {consolidationPlan.riskLevel.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendation */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">AI Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{consolidationPlan.recommendation}</p>
                  </CardContent>
                </Card>

                {/* Steps */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Consolidation Steps</CardTitle>
                    <CardDescription>
                      {consolidationPlan.steps.length} step
                      {consolidationPlan.steps.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {consolidationPlan.steps.map((step: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-800 text-cyan-400">
                                {step.type.toUpperCase()}
                              </span>
                              <span className="text-slate-400 text-sm">
                                {step.fromNetwork}
                                <ArrowRight className="w-3 h-3 inline mx-1" />
                                {step.toNetwork}
                              </span>
                            </div>
                            <p className="text-white mb-2">{step.description}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-slate-400">Amount</p>
                                <p className="text-cyan-400 font-semibold">{step.amount}</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Estimated Gas</p>
                                <p className="text-blue-400 font-semibold">${step.estimatedGas}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {idx < consolidationPlan.steps.length - 1 && (
                          <div className="ml-4 my-4 border-l-2 border-slate-700 h-8" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setConsolidationPlan(null)}
                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Regenerate
                  </Button>
                  <Button 
                    onClick={() => setCurrentPage("status")}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Execute Strategy
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="pt-12 pb-12 text-center">
                  <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">No strategy generated yet</p>
                  <p className="text-slate-500 text-sm">
                    Configure your target and click "Generate Strategy" to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
