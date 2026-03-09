import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

/**
 * Configuration Page - Initial Setup (Mandatory)
 * Only requires Covalent API key
 */
export default function ConfigurationPage() {
  const { setIsConfigured, setCurrentPage, setMessage } = useAppContext();
  const [masterKey, setMasterKey] = useState("");
  const [covalentKey, setCovalentKey] = useState("");
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
          setMessage({ type: "info", text: "Please configure your Covalent API key" });
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
    if (!covalentKey.trim()) {
      setMessage({ type: "error", text: "Please fill in the Covalent API key" });
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
        }),
      });

      if (response.ok) {
        setConfigStatus("configured");
        setMessage({ type: "success", text: "Configuration saved successfully!" });
        setCovalentKey("");
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
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Keiconsolidator</h1>
          <p className="text-slate-400">Initial Configuration Required</p>
        </div>

        {/* Main Card */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">System Setup</CardTitle>
            <CardDescription>Configure your Covalent API key to enable wallet analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Master Key Input */}
            {!showApiFields && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Master Admin Key</label>
                  <Input
                    type="password"
                    placeholder="Enter your master admin key"
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-500"
                  />
                  <p className="text-xs text-slate-500">This key is required to access and configure the system</p>
                </div>
                <Button
                  onClick={handleAuthenticate}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
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
              </>
            )}

            {/* API Key Input */}
            {showApiFields && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Covalent API Key</label>
                  <Input
                    type="password"
                    placeholder="Enter your Covalent API key"
                    value={covalentKey}
                    onChange={(e) => setCovalentKey(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-500"
                  />
                  <p className="text-xs text-slate-500">
                    Get your free API key at{" "}
                    <a
                      href="https://www.covalenthq.com/platform/auth/register/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      covalenthq.com
                    </a>
                  </p>
                </div>
                <Button
                  onClick={handleSaveConfig}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
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
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="bg-cyan-950/30 border-cyan-700/50">
          <CardContent className="pt-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-cyan-200">
              Your API keys are encrypted with AES-256-GCM and never exposed. This configuration is mandatory before using the system.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
