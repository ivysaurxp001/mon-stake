# 🔒 MON Staking Platform

A decentralized staking platform built on **Monad Testnet** that enables users to stake MON tokens and earn rewards through MetaMask Smart Accounts with ERC-4337 Account Abstraction.

## 🌟 Features

- **🔒 Secure Staking** - Lock MON tokens with 7-day time-lock mechanism
- **💰 10% APY Rewards** - Earn passive income on staked tokens
- **⚡ Smart Account Integration** - ERC-4337 with Pimlico bundler for gasless transactions
- **📊 Real-time Analytics** - Envio indexer for on-chain data and transaction history
- **🦊 MetaMask Support** - Seamless wallet connection with delegation toolkit
- **🎁 Flexible Rewards** - Claim anytime or auto-compound on unstake
- **🌐 Cross-chain Ready** - Supports Monad Testnet and Ethereum Sepolia

## 📋 Deployed Contracts

### Monad Testnet

| Contract | Address | Network |
|----------|---------|---------|
| **MonStaking** | [`0x91e33a594da3e8e2ad3af5195611cf8cabe75353`](https://testnet-explorer.monad.xyz/address/0x91e33a594da3e8e2ad3af5195611cf8cabe75353) | Monad Testnet |
| Smart Account Factory | `0x69Aa2f9fe1572F1B640E1bbc512f5c3a734fc77c` | Monad Testnet |

### Contract Details

- **Reward Rate**: 10% APY
- **Minimum Stake**: 0.1 MON
- **Lock Period**: 7 days (604,800 seconds)
- **Solidity Version**: 0.8.20
- **License**: MIT

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask wallet
- MON tokens on Monad Testnet

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mon-stake

# Install dependencies
npm install

# Copy environment file
cp env.example .env.local

# Configure environment variables
# Add your Pimlico API key and other settings

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 📋 Environment Variables

Create a `.env.local` file with:

```env
# DEFAULT CHAIN
NEXT_PUBLIC_CHAIN_ID=10143

# MONAD TESTNET
MONAD_RPC_URL=https://rpc.ankr.com/monad_testnet
MONAD_CHAIN_ID=10143

# STAKING CONTRACT (Deployed)
NEXT_PUBLIC_STAKING_CONTRACT=0x91e33a594da3e8e2ad3af5195611cf8cabe75353

# AA / PAYMASTER / BUNDLER (Pimlico)
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key_here

# ENVIO (GraphQL Endpoint)
NEXT_PUBLIC_ENVIO_GRAPHQL=http://localhost:3000/graphql
```

## 📖 How to Use

### 1. Connect Wallet
- Click "Connect MetaMask" button
- Approve the connection
- MetaMask will automatically switch to Monad Testnet

### 2. Deploy Smart Account (Optional)
- Go to `/deploy` page
- Click "Deploy Smart Account" for ERC-4337 support
- Approve the deployment transaction
- Fund your Smart Account with MON for gas

### 3. Stake MON Tokens
- Navigate to the staking form
- Enter amount to stake (minimum 0.1 MON)
- Click "Stake MON"
- Confirm transaction in MetaMask
- View confirmation with transaction hash

### 4. Monitor Dashboard
- Go to `/dashboard` to view:
  - Total staked amount
  - Pending rewards (real-time)
  - Lock status and countdown
  - Staking history from Envio
  - Total claimed rewards

### 5. Claim Rewards
- Click "Claim Rewards" to receive rewards without unstaking
- Rewards are calculated based on 10% APY
- Transfer happens instantly to your wallet

### 6. Unstake Tokens
- Wait for 7-day lock period to expire
- Click "Unstake" button
- Specify amount or unstake all
- Receive staked tokens + accumulated rewards

## 🏗️ Project Structure

```
mon-stake/
├── app/
│   ├── page.tsx                # Landing page
│   ├── dashboard/              # Dashboard with analytics
│   ├── deploy/                 # Smart Account deployment
│   └── layout.tsx              # Root layout
├── components/
│   ├── StakingForm.tsx         # Main staking UI
│   ├── MetaMaskProvider.tsx    # Wallet & Smart Account provider
│   ├── SmartAccountDeploy.tsx  # Deployment interface
│   ├── StakingHistory.tsx      # Envio integration
│   └── HeaderNav.tsx           # Navigation
├── lib/
│   ├── staking.ts              # Staking logic with ERC-4337
│   ├── smartAccount-deploy.ts  # Smart Account creation
│   ├── chain.ts                # Network configurations
│   ├── envio.ts                # Envio GraphQL client
│   └── clients.ts              # Viem clients
├── contracts/
│   └── DelegationStorage.sol   # Delegation contract
├── monad-erc20/
│   ├── contracts/
│   │   └── MonStaking.sol      # Main staking contract
│   └── scripts/
│       └── deploy.ts           # Deployment script
└── envio/
    └── config.yaml             # Envio indexer config
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context

### Blockchain
- **Network**: Monad Testnet (Chain ID: 10143)
- **Library**: Viem 2.x
- **Smart Accounts**: MetaMask Delegation Toolkit
- **Account Abstraction**: ERC-4337
- **Bundler**: Pimlico

### Smart Contracts
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat
- **Tools**: TypeChain for type generation

### Indexing & Data
- **Indexer**: Envio
- **Query**: GraphQL
- **Real-time**: WebSocket support

## 📄 Smart Contract (MonStaking.sol)

### Key Functions

```solidity
// Stake MON tokens
function stake() external payable

// Unstake tokens after lock period
function unstake(uint256 amount) external

// Claim rewards without unstaking
function claimRewards() external

// View user's stake information
function getStakeInfo(address user) external view returns (
    uint256 stakedAmount,
    uint256 pendingRewards,
    uint256 lockEndTime,
    bool isLocked
)
```

### Events

```solidity
event Staked(address indexed user, uint256 amount, uint256 timestamp);
event Unstaked(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);
event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp);
```

### Security Features

- ✅ Reentrancy protection
- ✅ Time-lock mechanism (7 days)
- ✅ Safe transfer patterns
- ✅ Minimum stake validation (0.1 MON)
- ✅ Overflow protection

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Test with coverage
npm run test:coverage
```

## 💡 Innovation Highlights

### 1. ERC-4337 Account Abstraction
First staking platform on Monad to implement full account abstraction with:
- Smart Account deployment via factory
- User operations via Pimlico bundler
- Gasless transactions support
- Batch operations capability

### 2. MetaMask Delegation Toolkit
Integration with MetaMask's official delegation toolkit:
- Hybrid implementation (EOA + Passkey)
- Deterministic address generation
- Counterfactual account support

### 3. Envio Indexer Integration
Real-time on-chain data with GraphQL:
- Transaction history
- Staking events
- Reward calculations
- User analytics

### 4. Developer Experience
Type-safe development with:
- Full TypeScript coverage
- Generated types from ABIs
- Comprehensive error handling
- Extensive logging for debugging

## 🌐 Deployment

### Frontend (Vercel)

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
```

### Smart Contract (Monad Testnet)

```bash
# Navigate to contract directory
cd monad-erc20

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Monad Testnet
npx hardhat run scripts/deploy.ts --network monadTestnet

# Contract deployed at: 0x91e33a594da3e8e2ad3af5195611cf8cabe75353
```

## 📊 Staking Mechanism

### Reward Calculation

```
Reward = (Staked Amount × Annual Rate × Time Staked) / (365 days × 100)

Example:
- Stake: 100 MON
- Rate: 10% APY
- Time: 7 days
- Reward: 100 × 10 × 7 / (365 × 100) = 0.1918 MON
```

### Lock Period

- **Duration**: 7 days (604,800 seconds)
- **Purpose**: Network stability and reward fairness
- **Status**: Real-time countdown displayed
- **Bypass**: Not possible (enforced by smart contract)

## 🔐 Security Considerations

- **Smart Contract**: Thoroughly tested, no known vulnerabilities
- **Private Keys**: Never expose in frontend or commits
- **RPC Endpoints**: Use reputable providers (Ankr)
- **User Permissions**: Explicit approval for all transactions
- **Gas Estimation**: Dynamic calculation based on network

## 📝 Development Roadmap

### ✅ Phase 1 - MVP (Completed)
- [x] MonStaking smart contract
- [x] Stake/Unstake functionality
- [x] Rewards calculation (10% APY)
- [x] Dashboard UI
- [x] MetaMask integration
- [x] Smart Account support (ERC-4337)
- [x] Envio indexer integration

### 🔄 Phase 2 - Enhancement (In Progress)
- [x] Pimlico bundler integration
- [x] Real-time staking history
- [ ] Mobile responsive design improvements
- [ ] Gas optimization for user operations
- [ ] Paymaster integration for sponsored transactions

### 🚀 Phase 3 - Advanced (Planned)
- [ ] Multiple staking tiers (30d, 90d, 365d)
- [ ] Compound rewards automation
- [ ] Referral program
- [ ] NFT reward boosters
- [ ] Governance voting with staked tokens
- [ ] Multi-token staking support

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support & Resources

- **Documentation**: Check `/docs` folder for detailed guides
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Monad Docs**: https://docs.monad.xyz
- **MetaMask Delegation**: https://docs.metamask.io/delegation-toolkit
- **Envio Docs**: https://docs.envio.dev

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- **Monad Labs** - For testnet infrastructure and support
- **MetaMask** - For delegation toolkit and Smart Account framework
- **Pimlico** - For bundler infrastructure
- **Envio** - For indexing services
- **Community** - All contributors and testers

---

**Built with ❤️ on Monad Testnet**

**Contract Address**: `0x91e33a594da3e8e2ad3af5195611cf8cabe75353`

**Live Demo**: [Your Vercel URL]

