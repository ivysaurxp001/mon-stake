import { createPublicClient, http } from "viem";
import { monadTestnet } from "./chain";

// Lấy RPC URL với fallback
const getRpcUrl = () => {
  // In browser, use NEXT_PUBLIC_ prefix
  const envUrl = process.env.NEXT_PUBLIC_MONAD_RPC_URL;
  if (envUrl && envUrl.trim() !== "") {
    console.log('🌐 Using RPC from env:', envUrl);
    return envUrl;
  }
  // Fallback to Ankr (more stable than Fastlane)
  console.log('🌐 Using default Ankr RPC');
  return "https://rpc.ankr.com/monad_testnet";
};

// Public client with timeout and retry config
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(getRpcUrl(), {
    timeout: 30000, // 30 seconds
    retryCount: 3,
    retryDelay: 2000
  })
});

// Bundler và Paymaster URLs (có thể để trống cho demo)
export const bundlerRpcUrl = process.env.BUNDLER_RPC_URL || "";
export const paymasterRpcUrl = process.env.PAYMASTER_RPC_URL || "";

