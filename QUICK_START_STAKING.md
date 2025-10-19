# ⚡ Quick Start: MON Staking Project

## 🎯 Goal
Clone dự án hiện tại → Biến thành MON Staking Platform

## 📋 Chuẩn bị

### Giữ lại:
- ✅ `lib/smartAccount.ts` - Smart account logic
- ✅ `lib/aa.ts` - Bundler & gas
- ✅ `components/MetaMaskProvider.tsx` - Wallet connection
- ✅ All gas configurations

### Xóa bỏ:
- ❌ `lib/delegation.ts`
- ❌ `components/DelegationForm.tsx`
- ❌ `app/delegation/`
- ❌ Old envio configs

---

## 🚀 3-Step Quick Start

### Step 1: Clone & Setup (5 phút)

```bash
# 1. Clone project
cd D:\build
cp -r metamask-monad-envio monad-staking
cd monad-staking

# 2. Clean up
rm lib/delegation.ts
rm components/DelegationForm.tsx
rm -rf app/delegation/
rm -rf envio/
rm *.md  # Remove old docs

# 3. New git repo
rm -rf .git
git init
git add .
git commit -m "Initial: MON Staking"

# 4. Update package.json name
# "name": "monad-staking"
```

### Step 2: Deploy Staking Contract (30 phút)

**Option A: Simple Contract (Recommended)**

```solidity
// contracts/SimpleStaking.sol
// Copy from ROADMAP_MON_STAKING.md → Phase 2
```

**Deploy:**
```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Init Hardhat
npx hardhat init

# Add contract
# Add deploy script
# Deploy
npx hardhat run scripts/deploy.ts --network monadTestnet

# Save contract address!
```

### Step 3: Build Staking UI (1 giờ)

```bash
# 1. Create lib/staking.ts
# Copy from ROADMAP_MON_STAKING.md → Phase 3.1

# 2. Create components/StakingForm.tsx
# Copy from ROADMAP_MON_STAKING.md → Phase 3.2

# 3. Update app/stake/page.tsx
# Simple import StakingForm

# 4. Test
npm run dev
```

---

## 🎯 Core Files Cần Tạo

### 1. `lib/staking.ts` (Core Logic)
```typescript
import { Address } from 'viem';

const STAKING_CONTRACT = '0x...' as Address;

export async function stake(smartAccount: any, amount: bigint) {
  // Stake MON using smart account
}

export async function unstake(smartAccount: any, amount: bigint) {
  // Unstake MON
}

export async function getStakeInfo(address: Address) {
  // Get stake info
}
```

### 2. `components/StakingForm.tsx` (UI)
```typescript
'use client';

export default function StakingForm() {
  return (
    <div>
      <input type="number" placeholder="Amount" />
      <button onClick={handleStake}>Stake</button>
      <button onClick={handleUnstake}>Unstake</button>
      <button onClick={handleClaim}>Claim Rewards</button>
    </div>
  );
}
```

### 3. `app/stake/page.tsx` (Page)
```typescript
import StakingForm from '@/components/StakingForm';

export default function StakePage() {
  return (
    <div>
      <h1>Stake MON</h1>
      <StakingForm />
    </div>
  );
}
```

---

## 🔥 MVP Version (Nhanh nhất)

**Chỉ cần 3 files để có MVP:**

1. **Staking Contract** (đơn giản nhất)
2. **lib/staking.ts** (chỉ stake/unstake)
3. **components/StakingForm.tsx** (UI cơ bản)

**Bỏ qua:**
- Envio indexer (dùng RPC trực tiếp)
- Dashboard phức tạp
- Advanced features

**Time: 2-3 giờ** ⚡

---

## 📊 Features Roadmap

### ✅ MVP (Must-Have)
- [ ] Stake MON
- [ ] Unstake MON
- [ ] View staked amount
- [ ] Basic UI

### 🟡 V1 (Should-Have)
- [ ] Claim rewards
- [ ] Lock period
- [ ] APY calculation
- [ ] Dashboard

### 🟢 V2 (Nice-to-Have)
- [ ] Multiple tiers
- [ ] Compound rewards
- [ ] Envio indexer
- [ ] Activity feed
- [ ] Referral system

---

## 🐛 Common Issues

### Issue 1: Smart Account không có MON để stake

**Fix:**
```typescript
// Get MON from faucet first
// Or transfer MON to smart account
```

### Issue 2: Gas estimation failed

**Fix:**
```typescript
// Reuse gas config from old project ✅
// lib/aa.ts already has gas logic
```

### Issue 3: Contract deployment failed

**Fix:**
```bash
# Check deployer has MON
# Check RPC is working
# Check contract code compiles
```

---

## 💡 Pro Tips

### 1. Test Contract First
```bash
# Test contract functions trước khi build UI
npx hardhat test
```

### 2. Reuse Old Code
```typescript
// Copy từ old project:
import { getMetaMaskSmartAccount } from '@/lib/smartAccount';
import { sendUserOp } from '@/lib/aa';

// Đã có sẵn gas config! ✅
```

### 3. Start Simple
```typescript
// Version 1: Chỉ stake/unstake
// Version 2: Thêm rewards
// Version 3: Thêm dashboard
```

### 4. Manual Testing
```bash
# Test từng function riêng lẻ
# Console.log everywhere
# Check transaction on explorer
```

---

## 🎯 Checklist Before Deploy

- [ ] Contract deployed & verified
- [ ] Contract address updated in code
- [ ] Smart account can connect
- [ ] Can stake successfully
- [ ] Can unstake successfully
- [ ] Gas works properly (from old config)
- [ ] UI looks good
- [ ] No console errors

---

## 🚀 Deploy

```bash
# 1. Push to GitHub
git remote add origin <new-repo>
git push -u origin main

# 2. Deploy to Vercel
vercel --prod

# 3. Update env vars on Vercel
NEXT_PUBLIC_STAKING_CONTRACT=0x...

# 4. Test production
```

---

## 📚 Resources

- **Full Roadmap:** `ROADMAP_MON_STAKING.md`
- **Contract Code:** Phase 2 in roadmap
- **Frontend Code:** Phase 3 in roadmap
- **Monad Docs:** https://docs.monad.xyz
- **Viem Docs:** https://viem.sh

---

**🎉 Ready?** Start with Step 1! 

Need help? Check `ROADMAP_MON_STAKING.md` for detailed guide.

