import { monadTestnet } from "./chain";

export type SmartAccount = {
  address: `0x${string}`;
};

/**
 * Simple smart account for staking - just wraps MetaMask account
 */
export async function getMetaMaskSmartAccount(): Promise<SmartAccount> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts connected");
  }

  const userAccount = accounts[0] as `0x${string}`;

  return {
    address: userAccount,
  };
}

/**
 * Get current connected account without requesting
 */
export async function getConnectedAccount(): Promise<`0x${string}` | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
}

