import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Save, Loader2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

/**
 * Settings Page - Allows users to reconfigure API keys
 */
export default function SettingsPage() {
  const { setCurrentPage, setMessage } = useAppContext();
  const [masterKey, setMasterKey] = useState("");
  const [covalentKey, setCovalentKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    if (!masterKey.trim()) {
      setError("Master Admin Key is required");
      return;
    }

    if (!covalentKey.trim()) {
      setError("Covalent API Key is required");
      return;
    }

    setError(null);
    setIsSaving(true);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save configuration");
      }

      setMessage({
        type: "success",
        text: "Configuration saved successfully! You can now analyze wallets.",
      });

      // Clear inputs
      setMasterKey("");
      setCovalentKey("");

      // Return to analysis page after 2 seconds
      setTimeout(() => {
        setCurrentPage("analysis");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save configuration");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentPage("analysis")}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Analysis
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Reconfigure your API keys</p>
        </div>

        {/* Settings Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">API Configuration</CardTitle>
            <CardDescription>Update your Covalent API key</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Master Admin Key */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Master Admin Key
              </label>
              <Input
                type="password"
                placeholder="Enter your master admin key"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Covalent API Key */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Covalent API Key
              </label>
              <Input
                type="password"
                placeholder="Enter your Covalent API key (cqt_...)"
                value={covalentKey}
                onChange={(e) => setCovalentKey(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-400 mt-2">
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

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving || !masterKey.trim() || !covalentKey.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="inline mr-2 animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="inline mr-2" size={18} />
                  Save Configuration
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 <strong>Tip:</strong> You can update your API keys anytime by clicking the Settings button.
          </p>
        </div>
      </div>
    </div>
  );
}
