# 🚀 MON Staking Platform - Deployment Guide

## 📋 Prerequisites

Before deploying, make sure you have:

1. ✅ Node.js 18+ installed
2. ✅ MetaMask wallet with Monad testnet configured
3. ✅ MON tokens for:
   - Deploying contract (gas fees)
   - Funding staking contract (for rewards pool)
   - Testing staking functionality
4. ✅ Private key for deployment (keep secure!)

## 🔐 Step 1: Environment Setup

Create `.env.local` file in project root:

```env
# Monad Network
MONAD_RPC_URL=https://rpc.ankr.com/monad_testnet
MONAD_CHAIN_ID=10143

# For contract deployment (IMPORTANT: Keep this secure!)
DEPLOYER_PRIVATE_KEY=your_private_key_without_0x_prefix

# Will update after deployment
NEXT_PUBLIC_STAKING_CONTRACT=0x0000000000000000000000000000000000000000
```

**⚠️ Security Warning:** Never commit `.env.local` to Git!

## 🔨 Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# Install Hardhat for contract deployment
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

## 📝 Step 3: Deploy Staking Contract

### 3.1 Compile Contract

```bash
npx hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### 3.2 Deploy to Monad Testnet

```bash
npx hardhat run scripts/deploy-staking.ts --network monadTestnet
```

Expected output:
```
🚀 Deploying MonStaking contract...
Deploying with account: 0x...
Account balance: X.XX MON

📝 Deploying MonStaking...
✅ MonStaking deployed to: 0xYOUR_CONTRACT_ADDRESS

📋 Next steps:
1. Update .env with:
   NEXT_PUBLIC_STAKING_CONTRACT=0xYOUR_CONTRACT_ADDRESS
...
```

### 3.3 Save Contract Address

Copy the deployed contract address and update `.env.local`:

```env
NEXT_PUBLIC_STAKING_CONTRACT=0xYOUR_CONTRACT_ADDRESS_HERE
```

### 3.4 Fund Contract with MON

The contract needs MON to pay out rewards. Transfer MON to contract:

```bash
# Using MetaMask or any wallet, send MON to:
# Contract Address: 0xYOUR_CONTRACT_ADDRESS

# Recommended amount: 1000+ MON for rewards pool
```

## 🧪 Step 4: Test Locally

### 4.1 Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

### 4.2 Test Staking Flow

1. **Connect MetaMask**
   - Click "Connect MetaMask"
   - Approve connection
   - Ensure you're on Monad testnet

2. **Stake MON**
   - Go to `/stake` page
   - Enter amount (e.g., 1 MON)
   - Click "Stake MON"
   - Confirm in MetaMask

3. **Check Dashboard**
   - Go to `/dashboard`
   - Verify staked amount shows
   - Check rewards accruing

4. **Claim Rewards** (after some time)
   - Go to `/stake`
   - Click "Claim Rewards"
   - Confirm transaction

5. **Unstake** (after 7 days)
   - Wait for lock period
   - Click "Unstake All"
   - Receive stake + rewards

## 🌐 Step 5: Deploy to Production (Vercel)

### 5.1 Push to GitHub

```bash
# Initialize git if needed
git init
git add .
git commit -m "Initial commit: MON Staking Platform"

# Create GitHub repo and push
gh repo create mon-staking --private
git remote add origin https://github.com/YOUR_USERNAME/mon-staking.git
git push -u origin main
```

### 5.2 Deploy on Vercel

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repo
4. Configure environment variables (see below)
5. Click "Deploy"

### 5.3 Configure Vercel Environment Variables

In Vercel dashboard, add these environment variables:

```
MONAD_RPC_URL=https://rpc.ankr.com/monad_testnet
MONAD_CHAIN_ID=10143
NEXT_PUBLIC_STAKING_CONTRACT=0xYOUR_CONTRACT_ADDRESS
```

**DO NOT** add `DEPLOYER_PRIVATE_KEY` to Vercel!

### 5.4 Verify Deployment

Visit your Vercel URL (e.g., `mon-staking.vercel.app`) and test:
- ✅ Connect MetaMask works
- ✅ Staking form loads
- ✅ Dashboard shows data
- ✅ Transactions execute properly

## 🔍 Step 6: Verify Contract (Optional)

### 6.1 Get Contract Source

Contract is in: `contracts/MonStaking.sol`

### 6.2 Verify on Monad Explorer

Visit: https://testnet-explorer.monad.xyz

1. Search for your contract address
2. Click "Verify & Publish"
3. Fill in details:
   - Compiler: 0.8.20
   - Optimization: Yes (200 runs)
4. Paste contract code
5. Submit

## 📊 Step 7: Monitor & Maintain

### Check Contract Balance

```bash
# Check how much MON is in contract for rewards
# Use block explorer or create a script
```

### Refill Rewards Pool

When rewards pool is low, send more MON to contract address.

### Monitor Transactions

- Use Monad Explorer to track all stake/unstake/claim events
- Monitor contract balance
- Track user activity

## 🐛 Troubleshooting

### Issue: "Transfer failed" when unstaking

**Cause:** Contract doesn't have enough MON for rewards  
**Fix:** Send more MON to contract address

### Issue: "Still locked" error

**Cause:** 7-day lock period hasn't expired  
**Fix:** Wait until lock period ends (check dashboard)

### Issue: Contract deployment failed

**Cause:** Insufficient MON for gas  
**Fix:** Get more MON from faucet

### Issue: MetaMask transaction fails

**Cause:** Gas estimation issues on Monad testnet  
**Fix:** Set manual gas limit in MetaMask

### Issue: Rewards showing as 0

**Cause:** Not enough time passed or no stake  
**Fix:** Wait a few minutes, rewards accrue per second

## 📈 Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract address added to `.env.local`
- [ ] Contract funded with MON for rewards
- [ ] Local testing completed
- [ ] Frontend deployed to Vercel
- [ ] Vercel environment variables configured
- [ ] Production testing completed
- [ ] Contract verified on explorer (optional)
- [ ] Documentation updated
- [ ] Monitoring set up

## 🎉 Success!

Your MON Staking Platform is now live! 

### URLs
- **Frontend:** `https://your-project.vercel.app`
- **Contract:** `https://testnet-explorer.monad.xyz/address/0xYOUR_CONTRACT`

### Share With Users
- Dashboard: `/dashboard`
- Staking: `/stake`

## 📞 Support

If you encounter issues:
1. Check console logs (F12 in browser)
2. Review transaction on Monad Explorer
3. Verify contract has sufficient MON
4. Check MetaMask is on correct network
5. Review this guide again

---

**Good luck with your deployment! 🚀**

