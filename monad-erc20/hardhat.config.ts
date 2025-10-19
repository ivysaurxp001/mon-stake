import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    monad: {
      url: process.env.MONAD_RPC_URL!,     // bạn đã xác nhận ở bước #1
      accounts: [process.env.DEPLOY_PK!],  // PK test để deploy token
      chainId: Number(process.env.MONAD_CHAIN_ID || 10143),
    },
    monadTestnet: {
      url: process.env.MONAD_RPC_URL || "https://testnet.monad.xyz/rpc",
      accounts: process.env.DEPLOY_PK ? [process.env.DEPLOY_PK] : [],
      chainId: 10143,
      gasPrice: 25000000000, // 25 gwei
      timeout: 120000, // 2 minutes timeout
      httpHeaders: {
        "Content-Type": "application/json",
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
export default config;
