# 🔒 MON Staking Platform

A decentralized staking platform for MON tokens on Monad Testnet, built with Next.js and MetaMask Smart Accounts.

## 🌟 Features

- **🔒 Stake MON Tokens** - Lock your MON to earn rewards
- **💰 10% APY Rewards** - Earn passive income on staked tokens
- **⏰ 7-Day Lock Period** - Secure staking with time-lock mechanism
- **🎁 Flexible Rewards** - Claim rewards anytime or compound on unstake
- **📊 Real-time Dashboard** - Monitor your stakes and rewards
- **🦊 MetaMask Integration** - Connect easily with MetaMask wallet
- **⚡ Smart Account Support** - EIP-7702 delegation support

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

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 📋 Environment Variables

Create a `.env.local` file with:

```env
# Monad Network
MONAD_RPC_URL=https://rpc.ankr.com/monad_testnet
MONAD_CHAIN_ID=10143

# Staking Contract (update after deployment)
NEXT_PUBLIC_STAKING_CONTRACT=0x...

# For contract deployment
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

## 🔨 Deploy Staking Contract

```bash
# Install Hardhat dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Compile contract
npx hardhat compile

# Deploy to Monad Testnet
npx hardhat run scripts/deploy-staking.ts --network monadTestnet

# Update .env.local with contract address
```

## 📖 How to Use

### 1. Connect Wallet
- Click "Connect MetaMask" button
- Approve the connection
- Switch to Monad Testnet if needed

### 2. Stake MON
- Go to `/stake` page
- Enter amount to stake (min 0.1 MON)
- Click "Stake MON"
- Confirm transaction in MetaMask

### 3. Monitor Dashboard
- Go to `/dashboard` to see:
  - Total staked amount
  - Pending rewards
  - Lock status
  - Time remaining

### 4. Claim Rewards
- Click "Claim Rewards" to receive rewards without unstaking
- Rewards are transferred to your wallet

### 5. Unstake
- Wait for 7-day lock period to expire
- Click "Unstake All" to receive stake + rewards
- Confirm transaction

## 🏗️ Project Structure

```
mon-stake/
├── app/
│   ├── dashboard/          # Dashboard page
│   ├── stake/              # Staking interface
│   └── ...
├── components/
│   ├── StakingForm.tsx     # Main staking UI
│   ├── MetaMaskProvider.tsx # Wallet connection
│   └── ...
├── lib/
│   ├── staking.ts          # Staking logic
│   ├── smartAccount.ts     # Smart account setup
│   └── ...
├── contracts/
│   └── MonStaking.sol      # Staking smart contract
├── scripts/
│   └── deploy-staking.ts   # Deployment script
└── hardhat.config.ts       # Hardhat configuration
```

## 📄 Smart Contract

### MonStaking.sol

The staking contract includes:

- **Constants:**
  - Reward Rate: 10% APY
  - Minimum Stake: 0.1 MON
  - Lock Period: 7 days

- **Functions:**
  - `stake()` - Stake MON tokens
  - `unstake(amount)` - Unstake tokens after lock period
  - `claimRewards()` - Claim rewards without unstaking
  - `getStakeInfo(user)` - View user's stake details

- **Events:**
  - `Staked(user, amount, timestamp)`
  - `Unstaked(user, amount, reward, timestamp)`
  - `RewardClaimed(user, amount, timestamp)`

## 🧪 Testing

```bash
# Run tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Blockchain:** Viem, Monad Testnet
- **Smart Accounts:** MetaMask Delegation Toolkit (EIP-7702)
- **Smart Contracts:** Solidity 0.8.20, Hardhat
- **Styling:** CSS Modules

## 📊 Key Features Details

### Staking Mechanism
- Users stake native MON tokens
- Rewards calculated in real-time based on 10% APY
- Formula: `reward = (staked * rate * time) / (365 days * 100)`

### Lock Period
- 7-day mandatory lock after staking
- Prevents early withdrawal
- Ensures network stability

### Rewards
- Accrued every second
- Can be claimed without unstaking
- Automatically included in unstake

### Smart Account Support
- EIP-7702 delegation support
- Seamless MetaMask integration
- Enhanced UX with smart wallets

## 🔐 Security

- ✅ Audited smart contract logic
- ✅ Time-lock mechanism
- ✅ Secure reward calculation
- ✅ Safe transfer patterns
- ✅ Access control

## 🌐 Deployment

### Frontend (Vercel)

```bash
# Push to GitHub
git push origin main

# Deploy on Vercel
vercel --prod

# Set environment variables on Vercel dashboard
```

### Contract (Monad Testnet)

```bash
# Deploy contract
npx hardhat run scripts/deploy-staking.ts --network monadTestnet

# Verify contract (optional)
npx hardhat verify --network monadTestnet <CONTRACT_ADDRESS>
```

## 📝 Development Roadmap

### ✅ Phase 1 - MVP (Completed)
- [x] Staking contract
- [x] Stake/Unstake functionality
- [x] Rewards calculation
- [x] Dashboard UI
- [x] MetaMask integration

### 🔄 Phase 2 - Enhancement (Planned)
- [ ] Multiple staking tiers (30d, 90d, 365d)
- [ ] Compound rewards feature
- [ ] Envio indexer for history
- [ ] Activity feed
- [ ] Mobile responsive design

### 🚀 Phase 3 - Advanced (Future)
- [ ] Referral system
- [ ] NFT boosters
- [ ] Governance voting
- [ ] Multi-token support

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues:** Open a GitHub issue
- **Docs:** Check `/docs` folder
- **Contact:** [Your contact info]

## 🎉 Acknowledgments

- Monad Labs for testnet infrastructure
- MetaMask for delegation toolkit
- Community contributors

---

**Built with ❤️ on Monad Testnet**


