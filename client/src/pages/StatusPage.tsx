import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

interface Transaction {
  id: string;
  hash: string;
  status: "pending" | "confirmed" | "failed";
  type: "transfer" | "bridge" | "swap";
  from: string;
  to: string;
  amount: string;
  token: string;
  network: string;
  timestamp: number;
  confirmations: number;
  gasUsed?: string;
  gasPrice?: string;
}

/**
 * Status Page - Transaction Monitoring
 */
export default function StatusPage() {
  const { setCurrentPage, connectedAccount } = useAppContext();
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      hash: "0x123abc...",
      status: "confirmed",
      type: "transfer",
      from: "Ethereum",
      to: "BNB Smart Chain",
      amount: "1.5",
      token: "ETH",
      network: "Ethereum",
      timestamp: Date.now() - 3600000,
      confirmations: 12,
      gasUsed: "21000",
      gasPrice: "45",
    },
    {
      id: "2",
      hash: "0x456def...",
      status: "pending",
      type: "bridge",
      from: "Polygon",
      to: "Arbitrum",
      amount: "500",
      token: "USDC",
      network: "Polygon",
      timestamp: Date.now() - 300000,
      confirmations: 2,
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Refresh transaction status
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  /**
   * Get status icon and color
   */
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
          label: "Confirmed",
          color: "bg-green-500/10 border-green-500/30",
        };
      case "pending":
        return {
          icon: <Clock className="w-5 h-5 text-yellow-400 animate-spin" />,
          label: "Pending",
          color: "bg-yellow-500/10 border-yellow-500/30",
        };
      case "failed":
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-400" />,
          label: "Failed",
          color: "bg-red-500/10 border-red-500/30",
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-slate-400" />,
          label: "Unknown",
          color: "bg-slate-500/10 border-slate-500/30",
        };
    }
  };

  /**
   * Format timestamp
   */
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  /**
   * Get transaction type badge color
   */
  const getTypeColor = (type: string) => {
    switch (type) {
      case "transfer":
        return "bg-blue-500/20 text-blue-300";
      case "bridge":
        return "bg-purple-500/20 text-purple-300";
      case "swap":
        return "bg-orange-500/20 text-orange-300";
      default:
        return "bg-slate-500/20 text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Transaction Status</h1>
            <p className="text-slate-400">Monitor your consolidation operations</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setCurrentPage("analysis")}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
            >
              Back to Analysis
            </Button>
          </div>
        </div>

        {/* Connected Account */}
        {connectedAccount && (
          <Card className="bg-slate-900 border-slate-800 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-slate-400 text-sm">Connected Account</p>
                  <p className="text-white font-mono">{connectedAccount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-cyan-400">{transactions.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-green-400">
                {transactions.filter((t) => t.status === "confirmed").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">
                {transactions.filter((t) => t.status === "pending").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-400">
                {transactions.filter((t) => t.status === "failed").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((tx) => {
              const statusInfo = getStatusInfo(tx.status);
              return (
                <Card key={tx.id} className="bg-slate-900 border-slate-800 overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Status and Type */}
                      <div className="flex items-center gap-4 flex-1">
                        {statusInfo.icon}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(tx.type)}`}>
                              {tx.type.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusInfo.color} border`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="font-semibold">{tx.amount} {tx.token}</span>
                            <ArrowRight className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-400">{tx.to}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Details */}
                      <div className="hidden md:block text-sm">
                        <p className="text-slate-400 mb-1">From {tx.from}</p>
                        <p className="text-slate-500 text-xs">{formatTime(tx.timestamp)}</p>
                      </div>

                      {/* Right: Gas and Link */}
                      <div className="text-right">
                        {tx.gasUsed && (
                          <p className="text-slate-400 text-sm mb-2">
                            Gas: <span className="text-cyan-400">{tx.gasUsed}</span>
                          </p>
                        )}
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                        >
                          View
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Confirmations Progress */}
                    {tx.status === "pending" && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-xs text-slate-400 mb-2">
                          Confirmations: {tx.confirmations}/12
                        </p>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all"
                            style={{ width: `${(tx.confirmations / 12) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-12 pb-12 text-center">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">No transactions yet</p>
                <p className="text-slate-500 text-sm">
                  Your consolidation transactions will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Box */}
        <Card className="bg-slate-800/50 border-slate-700 mt-8">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-200 mb-1">Transaction Tips</h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Pending transactions may take 10-30 minutes to confirm</li>
                  <li>• Check the explorer link for real-time blockchain updates</li>
                  <li>• Gas prices vary based on network congestion</li>
                  <li>• Failed transactions can be retried with adjusted parameters</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
