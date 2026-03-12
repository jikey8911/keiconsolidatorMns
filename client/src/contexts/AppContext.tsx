import React, { createContext, useContext, useState } from "react";

export interface AppContextType {
  // Configuration
  isConfigured: boolean;
  setIsConfigured: (value: boolean) => void;
  masterKey: string;
  setMasterKey: (value: string) => void;

  // Wallet Analysis
  currentWallet: string;
  setCurrentWallet: (value: string) => void;
  walletAnalysis: any;
  setWalletAnalysis: (value: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;

  // MetaMask
  connectedAccount: string | null;
  setConnectedAccount: (value: string | null) => void;
  isConnectingMetaMask: boolean;
  setIsConnectingMetaMask: (value: boolean) => void;

  // Consolidation
  consolidationPlan: any;
  setConsolidationPlan: (value: any) => void;
  targetWallet: string;
  setTargetWallet: (value: string) => void;

  // UI State
  currentPage: "config" | "analysis" | "consolidation" | "status" | "settings";
  setCurrentPage: (page: "config" | "analysis" | "consolidation" | "status" | "settings") => void;
  message: { type: "success" | "error" | "info"; text: string } | null;
  setMessage: (msg: { type: "success" | "error" | "info"; text: string } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [currentWallet, setCurrentWallet] = useState("");
  const [walletAnalysis, setWalletAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false);
  const [consolidationPlan, setConsolidationPlan] = useState(null);
  const [targetWallet, setTargetWallet] = useState("");
  const [currentPage, setCurrentPage] = useState<"config" | "analysis" | "consolidation" | "status" | "settings">("config");
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const value: AppContextType = {
    isConfigured,
    setIsConfigured,
    masterKey,
    setMasterKey,
    currentWallet,
    setCurrentWallet,
    walletAnalysis,
    setWalletAnalysis,
    isAnalyzing,
    setIsAnalyzing,
    connectedAccount,
    setConnectedAccount,
    isConnectingMetaMask,
    setIsConnectingMetaMask,
    consolidationPlan,
    setConsolidationPlan,
    targetWallet,
    setTargetWallet,
    currentPage,
    setCurrentPage,
    message,
    setMessage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
