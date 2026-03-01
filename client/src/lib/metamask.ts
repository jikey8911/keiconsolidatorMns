/**
 * MetaMask Integration Service
 */

export interface MetaMaskProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (args: any) => void) => void;
  removeListener: (event: string, callback: (args: any) => void) => void;
}

export function getMetaMaskProvider(): MetaMaskProvider | null {
  if (typeof window === "undefined") return null;
  return (window as any).ethereum || null;
}

export async function connectMetaMask(): Promise<string[]> {
  const provider = getMetaMaskProvider();
  if (!provider) {
    throw new Error("MetaMask not installed. Please install MetaMask extension.");
  }

  try {
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });
    return accounts;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("User rejected the connection request");
    }
    throw error;
  }
}

export async function getCurrentAccount(): Promise<string | null> {
  const provider = getMetaMaskProvider();
  if (!provider) return null;

  try {
    const accounts = await provider.request({
      method: "eth_accounts",
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
}

export async function switchNetwork(chainId: number): Promise<void> {
  const provider = getMetaMaskProvider();
  if (!provider) {
    throw new Error("MetaMask not installed");
  }

  const hexChainId = `0x${chainId.toString(16)}`;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      throw new Error(`Network with chainId ${chainId} not found in MetaMask`);
    }
    throw error;
  }
}

export async function sendTransaction(
  to: string,
  value: string,
  data?: string
): Promise<string> {
  const provider = getMetaMaskProvider();
  if (!provider) {
    throw new Error("MetaMask not installed");
  }

  const accounts = await provider.request({
    method: "eth_accounts",
  });

  if (accounts.length === 0) {
    throw new Error("No accounts found. Please connect MetaMask first.");
  }

  const txParams: any = {
    from: accounts[0],
    to,
    value,
  };

  if (data) {
    txParams.data = data;
  }

  try {
    const txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [txParams],
    });
    return txHash;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("User rejected the transaction");
    }
    throw error;
  }
}

export function isMetaMaskInstalled(): boolean {
  return getMetaMaskProvider() !== null;
}
