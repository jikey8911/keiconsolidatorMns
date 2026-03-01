import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

/**
 * Configuration Page - Initial Setup (Mandatory)
 */
export default function ConfigurationPage() {
  const { setIsConfigured, setCurrentPage, setMessage } = useAppContext();
  const [masterKey, setMasterKey] = useState("");
  const [covalentKey, setCovalentKey] = useState("");
  const [coingeckoKey, setCoingeckoKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<"unchecked" | "configured" | "pending">("unchecked");
  const [showApiFields, setShowApiFields] = useState(false);

  /**
   * Authenticate with master key
   */
  const handleAuthenticate = async () => {
    if (!masterKey.trim()) {
      setMessage({ type: "error", text: "Please enter your master admin key" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/admin/config/status", {
        headers: {
          Authorization: `Bearer ${masterKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConfigStatus(data.isConfigured ? "configured" : "pending");
        if (data.isConfigured) {
          setMessage({ type: "success", text: "Authentication successful. System is configured." });
          setIsConfigured(true);
          setTimeout(() => setCurrentPage("analysis"), 1500);
        } else {
          setShowApiFields(true);
          setMessage({ type: "info", text: "Please configure your API keys" });
        }
      } else {
        setMessage({ type: "error", text: "Invalid master key" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to authenticate" });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save configuration
   */
  const handleSaveConfig = async () => {
    if (!covalentKey.trim() || !coingeckoKey.trim()) {
      setMessage({ type: "error", text: "Please fill in all API keys" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${masterKey}`,
        },
        body: JSON.stringify({
          covalentApiKey: covalentKey,
          coingeckoApiKey: coingeckoKey,
        }),
      });

      if (response.ok) {
        setConfigStatus("configured");
        setMessage({ type: "success", text: "Configuration saved successfully!" });
        setCovalentKey("");
        setCoingeckoKey("");
        setIsConfigured(true);
        setTimeout(() => setCurrentPage("analysis"), 1500);
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.message || "Failed to save configuration" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save configuration" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Keiconsolidator</h1>
          <p className="text-slate-400">Initial Configuration Required</p>
        </div>

        {/* Main Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">System Setup</CardTitle>
            <CardDescription>Configure your API keys to enable wallet analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Master Key Input */}
            {!showApiFields && (
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Master Admin Key
                </label>
                <Input
                  type="password"
                  placeholder="Enter your master admin key"
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
                <p className="text-xs text-slate-400 mt-2">
                  This key is required to access and configure the system
                </p>
              </div>
            )}

            {/* API Keys Form */}
            {showApiFields && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Covalent API Key
                  </label>
                  <Input
                    type="password"
                    placeholder="cqt_..."
                    value={covalentKey}
                    onChange={(e) => setCovalentKey(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Get your free key at{" "}
                    <a
                      href="https://www.covalenthq.com/platform/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      covalenthq.com
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    CoinGecko API Key
                  </label>
                  <Input
                    type="password"
                    placeholder="CG-..."
                    value={coingeckoKey}
                    onChange={(e) => setCoingeckoKey(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Get your free key at{" "}
                    <a
                      href="https://www.coingecko.com/en/api/pricing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      coingecko.com
                    </a>
                  </p>
                </div>
              </>
            )}

            {/* Status Message */}
            {configStatus === "configured" && (
              <div className="flex items-gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-300">System is configured and ready to use</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              {!showApiFields ? (
                <Button
                  onClick={handleAuthenticate}
                  disabled={!masterKey.trim() || isLoading}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Authenticate"
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowApiFields(false);
                      setCovalentKey("");
                      setCoingeckoKey("");
                    }}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSaveConfig}
                    disabled={!covalentKey.trim() || !coingeckoKey.trim() || isLoading}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Configuration"
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-200 mb-1">Security First</h3>
              <p className="text-sm text-slate-400">
                Your API keys are encrypted with AES-256-GCM and never exposed. This configuration is mandatory before using the system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
