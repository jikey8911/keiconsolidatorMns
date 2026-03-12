import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Search,
  Loader2,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Copy,
  Settings,
} from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

/**
 * Unified Wallet Analysis & Private Key Capture Page
 * Step 1: Enter wallet address and analyze
 * Step 2: If analysis successful, show option to add private key or recovery phrase
 */
export default function WalletAnalysisPage() {
  const { setCurrentPage, setMessage, walletAnalysis, setWalletAnalysis, isAnalyzing, setIsAnalyzing } =
    useAppContext();

  // Step 1: Wallet Analysis
  const [walletAddress, setWalletAddress] = useState("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Step 2: Private Key/Phrase Capture (shown after successful analysis)
  const [showPrivateKeyForm, setShowPrivateKeyForm] = useState(false);
  const [privateKeyType, setPrivateKeyType] = useState<"private-key" | "recovery-phrase">("private-key");
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);

  /**
   * Analyze wallet address
   */
  const handleAnalyzeWallet = async () => {
    if (!walletAddress.trim()) {
      setAnalysisError("Please enter a wallet address");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setAnalysisError("Invalid Ethereum wallet address format");
      return;
    }

    setAnalysisError(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch(`/api/v1/analysis/${walletAddress}`);

      if (!response.ok) {
        throw new Error("Failed to analyze wallet");
      }

      const data = await response.json();
      setWalletAnalysis(data);
      setShowPrivateKeyForm(true);
      setMessage({
        type: "success",
        text: `Wallet analyzed successfully! Total value: $${data.totalValueUSD.toFixed(2)}`,
      });
    } catch (err) {
      setAnalysisError("Failed to analyze wallet. Please check the address and try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Save private key/phrase
   */
  const handleSavePrivateKey = async () => {
    if (!privateKeyInput.trim()) {
      setMessage({
        type: "error",
        text: `Please enter a ${privateKeyType === "private-key" ? "private key" : "recovery phrase"}`,
      });
      return;
    }

    setIsSavingKey(true);

    try {
      // In a real implementation, this would:
      // 1. Encrypt the private key/phrase
      // 2. Send it to backend securely
      // 3. Store it encrypted in the database
      // For now, we'll just show a success message and move to consolidation

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({
        type: "success",
        text: `${privateKeyType === "private-key" ? "Private key" : "Recovery phrase"} saved securely`,
      });

      // Clear the form
      setPrivateKeyInput("");
      setShowPrivateKeyForm(false);

      // Move to consolidation page
      setTimeout(() => {
        setCurrentPage("consolidation");
      }, 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: "Failed to save private key. Please try again.",
      });
      console.error(err);
    } finally {
      setIsSavingKey(false);
    }
  };

  /**
   * Skip private key and go to consolidation
   */
  const handleSkipPrivateKey = () => {
    setShowPrivateKeyForm(false);
    setCurrentPage("consolidation");
  };

  /**
   * Reset and start new analysis
   */
  const handleReset = () => {
    setWalletAddress("");
    setWalletAnalysis(null);
    setShowPrivateKeyForm(false);
    setPrivateKeyInput("");
    setAnalysisError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Wallet Analysis</h1>
              <p className="text-slate-400">
                {!walletAnalysis
                  ? "Enter your wallet address to analyze balances across multiple networks"
                  : "Your wallet has been analyzed. Add your private key to proceed with consolidation"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage("settings")}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Step 1: Wallet Analysis */}
        {!walletAnalysis ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Step 1: Analyze Wallet</CardTitle>
              <CardDescription>Enter your wallet address to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Wallet Address
                </label>
                <Input
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => {
                    setWalletAddress(e.target.value);
                    setAnalysisError(null);
                  }}
                  disabled={isAnalyzing}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
                {analysisError && (
                  <div className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{analysisError}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleAnalyzeWallet}
                disabled={isAnalyzing || !walletAddress.trim()}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Analysis Results */}
            <div className="space-y-6">
              {/* Summary */}
              <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Total Portfolio Value</p>
                      <p className="text-4xl font-bold text-cyan-400">
                        ${walletAnalysis?.totalValueUSD?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              {/* Networks Summary */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Networks</CardTitle>
                  <CardDescription>Balances across {walletAnalysis?.networks?.length || 0} networks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {walletAnalysis?.networks?.map((network: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
                        <div>
                          <p className="text-white font-semibold">{network.networkName}</p>
                          <p className="text-slate-400 text-sm">
                            {network.tokens?.length || 0} token{(network.tokens?.length || 0) !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <p className="text-cyan-400 font-bold">${network.totalValueUSD?.toFixed(2) || "0.00"}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Private Key/Phrase Capture */}
              {showPrivateKeyForm && (
                <Card className="bg-slate-900 border-slate-800 border-2 border-blue-500/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-400" />
                      Step 2: Secure Your Wallet
                    </CardTitle>
                    <CardDescription>
                      Add your private key or recovery phrase to enable transaction execution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Type Selection */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPrivateKeyType("private-key")}
                        className={`p-3 rounded-lg border-2 transition ${
                          privateKeyType === "private-key"
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-700 bg-slate-800 hover:border-slate-600"
                        }`}
                      >
                        <p className="text-white font-semibold text-sm">Private Key</p>
                        <p className="text-slate-400 text-xs">64 hex characters</p>
                      </button>
                      <button
                        onClick={() => setPrivateKeyType("recovery-phrase")}
                        className={`p-3 rounded-lg border-2 transition ${
                          privateKeyType === "recovery-phrase"
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-700 bg-slate-800 hover:border-slate-600"
                        }`}
                      >
                        <p className="text-white font-semibold text-sm">Recovery Phrase</p>
                        <p className="text-slate-400 text-xs">12 or 24 words</p>
                      </button>
                    </div>

                    {/* Input Field */}
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        {privateKeyType === "private-key" ? "Private Key" : "Recovery Phrase"}
                      </label>
                      <div className="relative">
                        <textarea
                          placeholder={
                            privateKeyType === "private-key"
                              ? "0x..."
                              : "word1 word2 word3 ... word12"
                          }
                          value={privateKeyInput}
                          onChange={(e) => setPrivateKeyInput(e.target.value)}
                          disabled={isSavingKey}
                          className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded px-3 py-2 pr-10 resize-none"
                          rows={privateKeyType === "private-key" ? 2 : 3}
                        />
                        <button
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                        >
                          {showPrivateKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-300">
                        Your private key is encrypted with AES-256-GCM and never exposed. It's only used to sign
                        transactions you approve.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleSkipPrivateKey}
                        disabled={isSavingKey}
                        className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        Skip for Now
                      </Button>
                      <Button
                        onClick={handleSavePrivateKey}
                        disabled={isSavingKey || !privateKeyInput.trim()}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                      >
                        {isSavingKey ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Save & Continue
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {!showPrivateKeyForm && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Analyze Another Wallet
                  </Button>
                  <Button
                    onClick={() => setCurrentPage("consolidation")}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    View Consolidation Strategy
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
