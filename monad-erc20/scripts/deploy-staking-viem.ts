import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

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
      http: [process.env.MONAD_RPC_URL || 'https://testnet.monad.xyz/rpc'],
    },
    public: {
      http: [process.env.MONAD_RPC_URL || 'https://testnet.monad.xyz/rpc'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://testnet-explorer.monad.xyz' },
  },
});

async function main() {
  console.log("🚀 Deploying MonStaking contract with Viem...\n");

  // Get private key
  const privateKey = process.env.DEPLOY_PK;
  if (!privateKey) {
    throw new Error("DEPLOY_PK not set in .env file");
  }

  // Add 0x prefix if not present
  const pk = privateKey.startsWith('0x') ? privateKey as `0x${string}` : `0x${privateKey}` as `0x${string}`;
  const account = privateKeyToAccount(pk);

  console.log("Deploying with account:", account.address);

  // Create clients
  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(),
  });

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log("Account balance:", formatEther(balance), "MON\n");

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no MON! Please fund it first.");
  }

  // Read contract bytecode and ABI
  const artifactPath = path.join(__dirname, '../artifacts/contracts/MonStaking.sol/MonStaking.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  console.log("📝 Deploying MonStaking...");

  // Deploy contract
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode as `0x${string}`,
    args: [], // No constructor arguments
    account,
  });

  console.log("Transaction hash:", hash);
  console.log("⏳ Waiting for confirmation...\n");

  // Wait for transaction receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  const contractAddress = receipt.contractAddress;
  
  if (!contractAddress) {
    throw new Error("Contract deployment failed - no address returned");
  }

  console.log("✅ MonStaking deployed to:", contractAddress);
  console.log("Block number:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());

  console.log("\n📋 Next steps:");
  console.log("1. Update .env.local in root project:");
  console.log(`   NEXT_PUBLIC_STAKING_CONTRACT=${contractAddress}`);
  console.log("\n2. Fund contract with MON for rewards:");
  console.log(`   Send some MON to: ${contractAddress}`);
  console.log("\n3. Update lib/staking.ts with contract address");
  console.log("\n4. Test staking on frontend!");

  // Save deployment info
  const deploymentInfo = {
    contract: "MonStaking",
    address: contractAddress,
    deployer: account.address,
    network: "Monad Testnet",
    chainId: 10143,
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

  console.log("\n📄 Deployment info:", JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const deploymentPath = path.join(__dirname, '../deployment-info.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  });

