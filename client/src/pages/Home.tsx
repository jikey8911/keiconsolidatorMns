import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

/**
 * Keiconsolidator - Home Page
 * Displays API status and information
 */
export default function Home() {
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Keiconsolidator</h1>
            <p className="text-xl text-slate-600">Multi-Chain Wallet Analysis API</p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-slate-900">API Status</h2>
            </div>
            <p className="text-slate-600 mb-6">
              Keiconsolidator API is running and ready to analyze wallet balances across multiple blockchain networks.
            </p>
            <div className="bg-slate-50 rounded p-4 mb-6">
              <p className="text-sm text-slate-600 mb-2"><strong>Base URL:</strong></p>
              <code className="text-slate-900 font-mono">/api/v1</code>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Supported Networks:</p>
                <p className="text-slate-600">Ethereum, BNB Smart Chain, Polygon, Arbitrum</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Features:</p>
                <p className="text-slate-600">Real-time token balances, USD price conversion, multi-chain analysis</p>
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">API Endpoints</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-mono text-sm text-blue-600 mb-1">GET /api/v1/analysis/:address</p>
                <p className="text-slate-600 text-sm">Analyze wallet balances across all supported networks</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-mono text-sm text-green-600 mb-1">POST /api/v1/admin/config</p>
                <p className="text-slate-600 text-sm">Configure API keys (admin only)</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="font-mono text-sm text-purple-600 mb-1">GET /api/v1/admin/config/status</p>
                <p className="text-slate-600 text-sm">Check configuration status (admin only)</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
            <p className="text-blue-800 text-sm mb-4">
              To use the API, you need to configure Covalent and CoinGecko API keys through the admin panel.
            </p>
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Configuration requires the Master Admin Key. Contact the system administrator for access.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4">
        <div className="max-w-2xl mx-auto text-center text-sm">
          <p>Keiconsolidator 2026 - Multi-Chain Wallet Analysis Platform</p>
        </div>
      </footer>
    </div>
  );
}
