import { createWalletClient, custom, createPublicClient, http } from "viem";
import { monadTestnet } from "./chain";
import { Implementation, toMetaMaskSmartAccount } from "@metamask/delegation-toolkit";

export type SmartAccount = {
  address: `0x${string}`;
  client?: any;
  signDelegation: (payload: any) => Promise<`0x${string}`>;
  encodeRedeemCalldata: (args: {
    delegations: any[][];
    modes: number[];
    executions: any[][];
  }) => `0x${string}`;
  environment: any;
  walletClient?: any;
  getFactoryArgs?: () => Promise<{ factory: `0x${string}`; factoryData: `0x${string}` }>;
};

// Environment for Smart Account (simplified for staking)
const STAKING_ENVIRONMENT = {
  chainId: monadTestnet.id,
  rpcUrl: "https://rpc.ankr.com/monad_testnet",
  bundlerUrl: "", // No bundler for now
  paymasterUrl: "", // No paymaster for now
  entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // Standard entry point
  DelegationManager: "0x0000000000000000000000000000000000000000", // No delegation for staking
};

let _sa: SmartAccount | null = null;

/**
 * Get MetaMask Smart Account for staking
 */
export async function getMetaMaskSmartAccount(): Promise<SmartAccount> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  // Get connected account
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts connected");
  }

  const userAccount = accounts[0] as `0x${string}`;

  // Create wallet client
  const walletClient = createWalletClient({
    chain: monadTestnet,
    transport: custom(window.ethereum),
    account: userAccount,
  });

  // Create public client
  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http("https://rpc.ankr.com/monad_testnet"),
  });

  console.log("🚀 Creating Smart Account for staking...");
  console.log("👤 User account:", userAccount);

  try {
    // Create MetaMask Smart Account
    const saImpl = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [userAccount, [], [], []],
      deploySalt: "0x",
      signer: { walletClient },
      environment: STAKING_ENVIRONMENT,
    });

    console.log("✅ Smart Account created:", saImpl.address);

    _sa = {
      address: saImpl.address as `0x${string}`,
      client: publicClient,
      signDelegation: async (payload: any) => {
        console.log("🔐 Signing delegation for staking...");
        return saImpl.signDelegation(payload);
      },
      encodeRedeemCalldata: (args) => {
        // For staking, we don't need complex delegation encoding
        return '0x' as `0x${string}`;
      },
      environment: STAKING_ENVIRONMENT,
      walletClient,
    };

    return _sa;
  } catch (error) {
    console.error("❌ Failed to create Smart Account:", error);
    throw error;
  }
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

/**
 * Check if Smart Account is deployed
 */
export async function isSmartAccountDeployed(address: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http("https://rpc.ankr.com/monad_testnet"),
    });

    const code = await publicClient.getCode({ address });
    return code !== '0x';
  } catch {
    return false;
  }
}
