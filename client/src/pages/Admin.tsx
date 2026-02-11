import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

/**
 * Admin Configuration Page
 * Allows administrators to configure API keys securely
 */
export default function Admin() {
  const [masterKey, setMasterKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [covalentKey, setCovalentKey] = useState("");
  const [coingeckoKey, setCoingeckoKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<"unchecked" | "configured" | "pending">("unchecked");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /**
   * Authenticate with master key
   */
  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/admin/config/status", {
        headers: {
          Authorization: `Bearer ${masterKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setConfigStatus(data.isConfigured ? "configured" : "pending");
        setMessage({ type: "success", text: "Authentication successful" });
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
      setMessage({ type: "error", text: "Please fill in all fields" });
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
        setMessage({ type: "success", text: "Configuration saved successfully" });
        setCovalentKey("");
        setCoingeckoKey("");
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

  /**
   * Logout
   */
  const handleLogout = () => {
    setIsAuthenticated(false);
    setMasterKey("");
    setCovalentKey("");
    setCoingeckoKey("");
    setMessage(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Keiconsolidator Admin</CardTitle>
            <CardDescription>Enter your master admin key to configure API keys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Master Admin Key</label>
              <Input
                type="password"
                placeholder="Enter your master admin key"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {message && (
              <div
                className={`flex items-gap-2 p-3 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <Button
              onClick={handleAuthenticate}
              disabled={!masterKey.trim() || isLoading}
              className="w-full"
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Keiconsolidator Admin</h1>
            <p className="text-slate-600 mt-1">Configure API keys for wallet analysis</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {configStatus === "configured" ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Configuration Status: Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span>Configuration Status: Pending</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {configStatus === "configured"
                ? "Your API keys are configured and the system is operational."
                : "Please configure your API keys to enable wallet analysis."}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys Configuration</CardTitle>
            <CardDescription>Enter your Covalent and CoinGecko API keys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Covalent Key */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Covalent API Key
              </label>
              <Input
                type="password"
                placeholder="cqt_..."
                value={covalentKey}
                onChange={(e) => setCovalentKey(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 mt-1">
                Get your free API key at{" "}
                <a
                  href="https://www.covalenthq.com/platform/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  covalenthq.com
                </a>
              </p>
            </div>

            {/* CoinGecko Key */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                CoinGecko API Key
              </label>
              <Input
                type="password"
                placeholder="CG-..."
                value={coingeckoKey}
                onChange={(e) => setCoingeckoKey(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 mt-1">
                Get your free API key at{" "}
                <a
                  href="https://www.coingecko.com/en/api/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  coingecko.com
                </a>
              </p>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`flex items-gap-2 p-3 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSaveConfig}
              disabled={!covalentKey.trim() || !coingeckoKey.trim() || isLoading}
              className="w-full"
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
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Security Notice</h3>
          <p className="text-blue-800 text-sm">
            Your API keys are encrypted using AES-256-GCM before being stored in the database. They are never exposed or logged.
          </p>
        </div>
      </div>
    </div>
  );
}
