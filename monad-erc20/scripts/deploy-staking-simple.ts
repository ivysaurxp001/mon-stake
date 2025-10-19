import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Hardcode RPC for testing - UPDATE THIS IF NEEDED
const RPC_URL = "https://rpc.ankr.com/monad_testnet";

// Read private key from command line or env
const PRIVATE_KEY = process.env.DEPLOY_PK || "";

if (!PRIVATE_KEY) {
  console.error("❌ Error: DEPLOY_PK not found in environment");
  console.log("\nPlease set DEPLOY_PK in .env file:");
  console.log("DEPLOY_PK=your_private_key_without_0x");
  process.exit(1);
}

// Define Monad testnet chain
const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://testnet-explorer.monad.xyz' },
  },
});

async function main() {
  console.log("🚀 Deploying MonStaking contract...\n");
  console.log("RPC URL:", RPC_URL);

  // Add 0x prefix if not present
  const pk = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY as `0x${string}` : `0x${PRIVATE_KEY}` as `0x${string}`;
  const account = privateKeyToAccount(pk);

  console.log("Deploying with account:", account.address);

  // Create clients
  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(RPC_URL, {
      timeout: 60000,
    }),
  });

  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(RPC_URL, {
      timeout: 60000,
    }),
  });

  try {
    // Check balance
    console.log("\n⏳ Checking balance...");
    const balance = await publicClient.getBalance({ address: account.address });
    console.log("Account balance:", formatEther(balance), "MON");

    if (balance === 0n) {
      throw new Error("❌ Deployer account has no MON! Please fund it first.");
    }

    // Read contract bytecode and ABI
    const artifactPath = path.join(__dirname, '../artifacts/contracts/MonStaking.sol/MonStaking.json');
    
    if (!fs.existsSync(artifactPath)) {
      throw new Error("❌ Contract artifact not found. Run 'npx hardhat compile' first.");
    }
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    console.log("\n📝 Deploying MonStaking contract...");

    // Deploy contract
    const hash = await walletClient.deployContract({
      abi: artifact.abi,
      bytecode: artifact.bytecode as `0x${string}`,
      args: [],
    });

    console.log("✅ Transaction hash:", hash);
    console.log("⏳ Waiting for confirmation...");

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash,
      timeout: 120000, // 2 minutes
    });
    
    const contractAddress = receipt.contractAddress;
    
    if (!contractAddress) {
      throw new Error("Contract deployment failed - no address returned");
    }

    console.log("\n🎉 SUCCESS!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Contract Address:", contractAddress);
    console.log("Block Number:", receipt.blockNumber);
    console.log("Gas Used:", receipt.gasUsed.toString());
    console.log("Transaction Hash:", hash);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("\n📋 NEXT STEPS:");
    console.log("1. Copy contract address above");
    console.log("2. Update .env.local in root project:");
    console.log(`   NEXT_PUBLIC_STAKING_CONTRACT=${contractAddress}`);
    console.log("\n3. Update lib/staking.ts:");
    console.log(`   export const STAKING_CONTRACT = '${contractAddress}' as Address;`);
    console.log("\n4. Fund contract with MON for rewards:");
    console.log(`   Send 100+ MON to: ${contractAddress}`);
    console.log("\n5. Test on frontend!");

    // Save deployment info
    const deploymentInfo = {
      contract: "MonStaking",
      address: contractAddress,
      deployer: account.address,
      network: "Monad Testnet",
      chainId: 10143,
      rpcUrl: RPC_URL,
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed.toString(),
      timestamp: new Date().toISOString(),
      constants: {
        REWARD_RATE: "10%",
        MIN_STAKE: "0.1 MON",
        LOCK_PERIOD: "7 days"
      }
    };

    const deploymentPath = path.join(__dirname, '../deployment-info.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to: deployment-info.json");
    
  } catch (error: any) {
    console.error("\n❌ Deployment failed!");
    console.error("Error:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Your account doesn't have enough MON for gas fees.");
      console.log("Please fund your account:", account.address);
    } else if (error.message.includes("nonce")) {
      console.log("\n💡 Nonce error - try again in a few seconds.");
    } else if (error.message.includes("timeout")) {
      console.log("\n💡 RPC timeout - the transaction might still succeed.");
      console.log("Check your account on block explorer:");
      console.log(`https://testnet-explorer.monad.xyz/address/${account.address}`);
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

