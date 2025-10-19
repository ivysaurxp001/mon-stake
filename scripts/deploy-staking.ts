import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying MonStaking contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MON");

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no MON! Please fund it first.");
  }

  // Deploy MonStaking contract
  console.log("\n📝 Deploying MonStaking...");
  const MonStaking = await ethers.getContractFactory("MonStaking");
  const monStaking = await MonStaking.deploy();
  
  await monStaking.waitForDeployment();
  const address = await monStaking.getAddress();

  console.log("\n✅ MonStaking deployed to:", address);
  console.log("\n📋 Next steps:");
  console.log("1. Update .env with:");
  console.log(`   NEXT_PUBLIC_STAKING_CONTRACT=${address}`);
  console.log("\n2. Fund contract with MON for rewards:");
  console.log(`   Send some MON to: ${address}`);
  console.log("\n3. Update lib/staking.ts with contract address");
  console.log("\n4. Test staking on frontend!");

  // Save deployment info
  const deploymentInfo = {
    contract: "MonStaking",
    address: address,
    deployer: deployer.address,
    network: "Monad Testnet",
    chainId: 10143,
    timestamp: new Date().toISOString(),
    constants: {
      REWARD_RATE: "10%",
      MIN_STAKE: "0.1 MON",
      LOCK_PERIOD: "7 days"
    }
  };

  console.log("\n📄 Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



