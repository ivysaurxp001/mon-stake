# 🚀 Roadmap: MON Staking Platform với Smart Account

## 🎯 Mục tiêu
Tạo platform cho phép Smart Account stake MON tokens, nhận rewards, và unstake.

## 📋 Phase 1: Setup Project Mới (30 phút)

### Bước 1.1: Clone và Rename
```bash
# Clone dự án hiện tại
cd D:\build
cp -r metamask-monad-envio monad-staking

cd monad-staking

# Update package.json
# Đổi name thành "monad-staking"
```

### Bước 1.2: Clean Up - Xóa những gì không cần
```bash
# Xóa delegation-related files
rm lib/delegation.ts
rm components/DelegationForm.tsx
rm app/delegation/page.tsx

# Xóa envio config cũ (sẽ tạo mới)
rm -rf envio/
rm config.yaml
rm schema.graphql

# Xóa documentation cũ
rm TODO_FIX_CORS.md
rm PROJECT_STATUS.md
rm CHECK_VERCEL_AUTODEPLOY.md
rm README_PROJECT.md

# Giữ lại:
# - lib/smartAccount.ts ✅
# - lib/aa.ts ✅ (bundler logic)
# - components/MetaMaskProvider.tsx ✅
```

### Bước 1.3: Git Init
```bash
# Disconnect from old repo
rm -rf .git
git init
git add .
git commit -m "Initial commit: MON Staking Platform"

# Create GitHub repo và push
gh repo create monad-staking --private
git remote add origin <new-repo-url>
git push -u origin main
```

---

## 📋 Phase 2: Research Staking Contract (1-2 giờ)

### Bước 2.1: Tìm hiểu Monad Staking
**Kiểm tra xem Monad có native staking contract chưa:**

```bash
# Option A: Monad có sẵn staking contract
# → Lấy address và ABI

# Option B: Monad chưa có staking
# → Deploy custom staking contract
```

### Bước 2.2: Nếu cần deploy contract

**Tạo Simple Staking Contract:**

```solidity
// contracts/MonStaking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MonStaking {
    mapping(address => uint256) public stakes;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public stakingTime;
    
    uint256 public constant REWARD_RATE = 10; // 10% APY
    uint256 public constant MIN_STAKE = 1 ether;
    uint256 public constant LOCK_PERIOD = 7 days;
    
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);
    event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp);
    
    function stake() external payable {
        require(msg.value >= MIN_STAKE, "Min stake is 1 MON");
        
        // Calculate pending rewards before adding new stake
        if (stakes[msg.sender] > 0) {
            _calculateRewards(msg.sender);
        }
        
        stakes[msg.sender] += msg.value;
        stakingTime[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, msg.value, block.timestamp);
    }
    
    function unstake(uint256 amount) external {
        require(stakes[msg.sender] >= amount, "Insufficient stake");
        require(block.timestamp >= stakingTime[msg.sender] + LOCK_PERIOD, "Still locked");
        
        _calculateRewards(msg.sender);
        
        stakes[msg.sender] -= amount;
        uint256 totalAmount = amount + rewards[msg.sender];
        rewards[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: totalAmount}("");
        require(success, "Transfer failed");
        
        emit Unstaked(msg.sender, amount, rewards[msg.sender], block.timestamp);
    }
    
    function claimRewards() external {
        _calculateRewards(msg.sender);
        
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards");
        
        rewards[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(msg.sender, reward, block.timestamp);
    }
    
    function _calculateRewards(address user) internal {
        if (stakes[user] == 0) return;
        
        uint256 timeElapsed = block.timestamp - stakingTime[user];
        uint256 reward = (stakes[user] * REWARD_RATE * timeElapsed) / (365 days * 100);
        rewards[user] += reward;
        stakingTime[user] = block.timestamp;
    }
    
    function getStakeInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 pendingRewards,
        uint256 lockEndsAt,
        bool canUnstake
    ) {
        stakedAmount = stakes[user];
        
        // Calculate pending rewards
        if (stakedAmount > 0) {
            uint256 timeElapsed = block.timestamp - stakingTime[user];
            pendingRewards = rewards[user] + (stakedAmount * REWARD_RATE * timeElapsed) / (365 days * 100);
        }
        
        lockEndsAt = stakingTime[user] + LOCK_PERIOD;
        canUnstake = block.timestamp >= lockEndsAt;
        
        return (stakedAmount, pendingRewards, lockEndsAt, canUnstake);
    }
}
```

**Deploy script:**
```typescript
// scripts/deploy.ts
import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from './chains';

async function main() {
  const account = privateKeyToAccount(`0x${process.env.DEPLOYER_PRIVATE_KEY}`);
  
  const client = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http('https://rpc.ankr.com/monad_testnet')
  });
  
  // Deploy contract bytecode here
  const hash = await client.deployContract({
    abi: MonStakingABI,
    bytecode: '0x...',
  });
  
  console.log('Deployed at:', hash);
}

main();
```

---

## 📋 Phase 3: Frontend - Staking Logic (2-3 giờ)

### Bước 3.1: Tạo Staking Library

**File: `lib/staking.ts`**
```typescript
import { parseEther, formatEther, Address } from 'viem';
import { getPublicClient } from './chain';

const STAKING_CONTRACT = '0x...' as Address; // Contract address after deploy

export const STAKING_ABI = [
  {
    name: 'stake',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: []
  },
  {
    name: 'unstake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'claimRewards',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'getStakeInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'stakedAmount', type: 'uint256' },
      { name: 'pendingRewards', type: 'uint256' },
      { name: 'lockEndsAt', type: 'uint256' },
      { name: 'canUnstake', type: 'bool' }
    ]
  },
  // Events
  {
    name: 'Staked',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' }
    ]
  },
  {
    name: 'Unstaked',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256' },
      { name: 'reward', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' }
    ]
  },
  {
    name: 'RewardClaimed',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' }
    ]
  }
];

export interface StakeInfo {
  stakedAmount: bigint;
  pendingRewards: bigint;
  lockEndsAt: bigint;
  canUnstake: boolean;
}

export async function getStakeInfo(userAddress: Address): Promise<StakeInfo> {
  const client = getPublicClient();
  
  const result = await client.readContract({
    address: STAKING_CONTRACT,
    abi: STAKING_ABI,
    functionName: 'getStakeInfo',
    args: [userAddress]
  });
  
  return {
    stakedAmount: result[0],
    pendingRewards: result[1],
    lockEndsAt: result[2],
    canUnstake: result[3]
  };
}

export async function stake(smartAccount: any, amount: bigint) {
  // Use smart account to stake
  const userOp = await smartAccount.sendTransaction({
    to: STAKING_CONTRACT,
    value: amount,
    data: '0x', // stake() function
  });
  
  return userOp;
}

export async function unstake(smartAccount: any, amount: bigint) {
  const client = getPublicClient();
  
  const data = client.encodeFunctionData({
    abi: STAKING_ABI,
    functionName: 'unstake',
    args: [amount]
  });
  
  const userOp = await smartAccount.sendTransaction({
    to: STAKING_CONTRACT,
    value: 0n,
    data,
  });
  
  return userOp;
}

export async function claimRewards(smartAccount: any) {
  const client = getPublicClient();
  
  const data = client.encodeFunctionData({
    abi: STAKING_ABI,
    functionName: 'claimRewards',
    args: []
  });
  
  const userOp = await smartAccount.sendTransaction({
    to: STAKING_CONTRACT,
    value: 0n,
    data,
  });
  
  return userOp;
}
```

### Bước 3.2: Tạo Staking Form Component

**File: `components/StakingForm.tsx`**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useMetaMask } from './MetaMaskProvider';
import { stake, unstake, claimRewards, getStakeInfo, type StakeInfo } from '@/lib/staking';
import { formatEther, parseEther } from 'viem';

export default function StakingForm() {
  const { smartAccount } = useMetaMask();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
  
  useEffect(() => {
    if (smartAccount?.address) {
      loadStakeInfo();
    }
  }, [smartAccount]);
  
  async function loadStakeInfo() {
    if (!smartAccount?.address) return;
    
    try {
      const info = await getStakeInfo(smartAccount.address);
      setStakeInfo(info);
    } catch (error) {
      console.error('Failed to load stake info:', error);
    }
  }
  
  async function handleStake() {
    if (!smartAccount || !amount) return;
    
    try {
      setLoading(true);
      const amountWei = parseEther(amount);
      await stake(smartAccount, amountWei);
      
      alert('Staked successfully!');
      setAmount('');
      await loadStakeInfo();
    } catch (error) {
      console.error('Stake failed:', error);
      alert('Stake failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleUnstake() {
    if (!smartAccount || !stakeInfo) return;
    
    try {
      setLoading(true);
      await unstake(smartAccount, stakeInfo.stakedAmount);
      
      alert('Unstaked successfully!');
      await loadStakeInfo();
    } catch (error) {
      console.error('Unstake failed:', error);
      alert('Unstake failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleClaimRewards() {
    if (!smartAccount) return;
    
    try {
      setLoading(true);
      await claimRewards(smartAccount);
      
      alert('Rewards claimed successfully!');
      await loadStakeInfo();
    } catch (error) {
      console.error('Claim failed:', error);
      alert('Claim failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }
  
  if (!smartAccount) {
    return (
      <div className="card">
        <p>Please connect MetaMask first</p>
      </div>
    );
  }
  
  return (
    <div className="staking-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="card card--accent">
          <div className="stat-card">
            <div className="stat-card__icon">💰</div>
            <div className="stat-card__content">
              <div className="stat-card__value">
                {stakeInfo ? formatEther(stakeInfo.stakedAmount) : '0'} MON
              </div>
              <div className="stat-card__label">Staked Amount</div>
            </div>
          </div>
        </div>
        
        <div className="card card--success">
          <div className="stat-card">
            <div className="stat-card__icon">🎁</div>
            <div className="stat-card__content">
              <div className="stat-card__value">
                {stakeInfo ? formatEther(stakeInfo.pendingRewards) : '0'} MON
              </div>
              <div className="stat-card__label">Pending Rewards</div>
            </div>
          </div>
        </div>
        
        <div className="card card--info">
          <div className="stat-card">
            <div className="stat-card__icon">🔒</div>
            <div className="stat-card__content">
              <div className="stat-card__value">
                {stakeInfo?.canUnstake ? 'Unlocked' : 'Locked'}
              </div>
              <div className="stat-card__label">Status</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stake Form */}
      <div className="card">
        <h3>Stake MON</h3>
        <div className="form-group">
          <label>Amount (MON)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to stake"
            min="1"
            step="0.1"
          />
        </div>
        
        <button
          onClick={handleStake}
          disabled={loading || !amount}
          className="button button--primary"
        >
          {loading ? 'Staking...' : 'Stake MON'}
        </button>
      </div>
      
      {/* Actions */}
      <div className="card">
        <h3>Manage Stake</h3>
        <div className="button-group">
          <button
            onClick={handleUnstake}
            disabled={loading || !stakeInfo?.canUnstake || stakeInfo?.stakedAmount === 0n}
            className="button button--warning"
          >
            {loading ? 'Processing...' : 'Unstake All'}
          </button>
          
          <button
            onClick={handleClaimRewards}
            disabled={loading || !stakeInfo || stakeInfo.pendingRewards === 0n}
            className="button button--success"
          >
            {loading ? 'Processing...' : 'Claim Rewards'}
          </button>
        </div>
        
        {stakeInfo && !stakeInfo.canUnstake && (
          <p className="warning">
            ⏳ Locked until: {new Date(Number(stakeInfo.lockEndsAt) * 1000).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## 📋 Phase 4: Envio Indexer cho Staking (1 giờ)

### Bước 4.1: Envio Config

**File: `envio/config.yaml`**
```yaml
name: monad-staking-indexer
description: MON Staking indexer for Monad testnet
preload_handlers: true

contracts:
  - name: MonStaking
    handler: src/EventHandlers.ts
    events:
      - event: Staked(address indexed user, uint256 amount, uint256 timestamp)
      - event: Unstaked(address indexed user, uint256 amount, uint256 reward, uint256 timestamp)
      - event: RewardClaimed(address indexed user, uint256 amount, uint256 timestamp)

networks:
  - id: 10143
    start_block: 0  # Update sau khi deploy contract
    rpc: https://rpc.ankr.com/monad_testnet
    contracts:
      - name: MonStaking
        address: 0x...  # Update sau khi deploy
        start_block: 0
```

### Bước 4.2: GraphQL Schema

**File: `envio/schema.graphql`**
```graphql
type StakeEvent @entity {
  id: ID!
  user: Bytes!
  amount: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}

type UnstakeEvent @entity {
  id: ID!
  user: Bytes!
  amount: BigInt!
  reward: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}

type RewardClaim @entity {
  id: ID!
  user: Bytes!
  amount: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}

type UserStake @entity {
  id: ID!  # user address
  totalStaked: BigInt!
  totalUnstaked: BigInt!
  totalRewardsClaimed: BigInt!
  stakeCount: Int!
  unstakeCount: Int!
  lastStakeAt: BigInt
  lastUnstakeAt: BigInt
}
```

### Bước 4.3: Event Handlers

**File: `envio/src/EventHandlers.ts`**
```typescript
import { StakeEvent, UnstakeEvent, RewardClaim, UserStake } from "../generated/src/Types.gen";

export function MonStaking_Staked_handler(event: any): void {
  // Create StakeEvent
  const stakeEvent: StakeEvent = {
    id: event.transactionHash + "-" + event.logIndex.toString(),
    user: event.params.user,
    amount: event.params.amount,
    timestamp: event.params.timestamp,
    blockNumber: event.blockNumber,
    transactionHash: event.transactionHash,
  };
  
  event.context.StakeEvent.set(stakeEvent);
  
  // Update UserStake aggregation
  const userId = event.params.user.toLowerCase();
  let userStake = event.context.UserStake.get(userId);
  
  if (!userStake) {
    userStake = {
      id: userId,
      totalStaked: 0n,
      totalUnstaked: 0n,
      totalRewardsClaimed: 0n,
      stakeCount: 0,
      unstakeCount: 0,
      lastStakeAt: null,
      lastUnstakeAt: null,
    };
  }
  
  userStake.totalStaked += event.params.amount;
  userStake.stakeCount += 1;
  userStake.lastStakeAt = event.params.timestamp;
  
  event.context.UserStake.set(userStake);
}

export function MonStaking_Unstaked_handler(event: any): void {
  // Create UnstakeEvent
  const unstakeEvent: UnstakeEvent = {
    id: event.transactionHash + "-" + event.logIndex.toString(),
    user: event.params.user,
    amount: event.params.amount,
    reward: event.params.reward,
    timestamp: event.params.timestamp,
    blockNumber: event.blockNumber,
    transactionHash: event.transactionHash,
  };
  
  event.context.UnstakeEvent.set(unstakeEvent);
  
  // Update UserStake
  const userId = event.params.user.toLowerCase();
  let userStake = event.context.UserStake.get(userId);
  
  if (userStake) {
    userStake.totalUnstaked += event.params.amount;
    userStake.unstakeCount += 1;
    userStake.lastUnstakeAt = event.params.timestamp;
    
    event.context.UserStake.set(userStake);
  }
}

export function MonStaking_RewardClaimed_handler(event: any): void {
  // Create RewardClaim
  const rewardClaim: RewardClaim = {
    id: event.transactionHash + "-" + event.logIndex.toString(),
    user: event.params.user,
    amount: event.params.amount,
    timestamp: event.params.timestamp,
    blockNumber: event.blockNumber,
    transactionHash: event.transactionHash,
  };
  
  event.context.RewardClaim.set(rewardClaim);
  
  // Update UserStake
  const userId = event.params.user.toLowerCase();
  let userStake = event.context.UserStake.get(userId);
  
  if (userStake) {
    userStake.totalRewardsClaimed += event.params.amount;
    event.context.UserStake.set(userStake);
  }
}
```

---

## 📋 Phase 5: Dashboard Page (1 giờ)

### Bước 5.1: Update Dashboard

**File: `app/dashboard/page.tsx`**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useMetaMask } from '@/components/MetaMaskProvider';
import { getStakeInfo, type StakeInfo } from '@/lib/staking';
import { formatEther } from 'viem';

export default function Dashboard() {
  const { smartAccount } = useMetaMask();
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  
  useEffect(() => {
    if (smartAccount?.address) {
      loadData();
    }
  }, [smartAccount]);
  
  async function loadData() {
    // Load stake info
    const info = await getStakeInfo(smartAccount.address);
    setStakeInfo(info);
    
    // Load events from Envio (implement later)
    // const events = await queryStakingEvents(smartAccount.address);
    // setEvents(events);
  }
  
  return (
    <div className="page-content">
      <h1>📊 Staking Dashboard</h1>
      
      {/* Stats */}
      <div className="stats-grid">
        <div className="card">
          <h3>💰 Total Staked</h3>
          <p className="stat-value">
            {stakeInfo ? formatEther(stakeInfo.stakedAmount) : '0'} MON
          </p>
        </div>
        
        <div className="card">
          <h3>🎁 Pending Rewards</h3>
          <p className="stat-value">
            {stakeInfo ? formatEther(stakeInfo.pendingRewards) : '0'} MON
          </p>
        </div>
        
        <div className="card">
          <h3>📈 APY</h3>
          <p className="stat-value">10%</p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="card">
        <h3>Recent Activity</h3>
        {/* Implement activity list from Envio */}
      </div>
    </div>
  );
}
```

### Bước 5.2: Stake Page

**File: `app/stake/page.tsx`**
```typescript
import StakingForm from '@/components/StakingForm';

export default function StakePage() {
  return (
    <div className="page-content">
      <h1>🔒 Stake MON</h1>
      <p>Stake your MON tokens to earn 10% APY rewards</p>
      
      <StakingForm />
    </div>
  );
}
```

---

## 📋 Phase 6: Testing (1-2 giờ)

### Bước 6.1: Local Testing
```bash
# Run dev server
npm run dev

# Test:
# 1. Connect MetaMask
# 2. Create Smart Account
# 3. Stake MON
# 4. Check dashboard
# 5. Claim rewards
# 6. Unstake
```

### Bước 6.2: Deploy Contract
```bash
# Deploy staking contract to Monad testnet
npm run deploy:contract

# Get contract address
# Update envio/config.yaml với address mới
```

### Bước 6.3: Deploy Envio
```bash
cd envio
envio deploy

# Copy GraphQL endpoint
# Update .env.local
```

### Bước 6.4: Deploy Vercel
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploy
# Or manual: vercel --prod
```

---

## 📋 Phase 7: Polish & Features (Optional)

### Advanced Features:
1. **Multiple staking tiers** (30 days, 90 days, 365 days)
2. **Compound rewards** automatically
3. **Referral system** (earn bonus for referring)
4. **NFT boosters** (stake NFT to boost APY)
5. **Governance** (stakers can vote)

---

## 🎯 Timeline Summary

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| 1 | Clone & Setup | 30 min | 🔴 Critical |
| 2 | Research & Deploy Contract | 1-2 hours | 🔴 Critical |
| 3 | Frontend Staking Logic | 2-3 hours | 🔴 Critical |
| 4 | Envio Indexer | 1 hour | 🟡 Important |
| 5 | Dashboard UI | 1 hour | 🟡 Important |
| 6 | Testing & Deploy | 1-2 hours | 🔴 Critical |
| 7 | Advanced Features | 3-5 hours | 🟢 Nice-to-have |

**Total: 6.5 - 12.5 hours** (1-2 ngày làm việc)

---

## ✅ Checklist

### Phase 1: Setup ✅
- [ ] Clone project
- [ ] Rename & clean up
- [ ] New Git repo
- [ ] Update package.json

### Phase 2: Smart Contract ✅
- [ ] Research Monad staking
- [ ] Write staking contract
- [ ] Test contract locally
- [ ] Deploy to Monad testnet
- [ ] Verify contract

### Phase 3: Frontend ✅
- [ ] `lib/staking.ts` - Core logic
- [ ] `components/StakingForm.tsx` - UI
- [ ] Integrate with Smart Account
- [ ] Test stake/unstake/claim

### Phase 4: Indexer ✅
- [ ] Envio config
- [ ] GraphQL schema
- [ ] Event handlers
- [ ] Deploy Envio
- [ ] Test queries

### Phase 5: Dashboard ✅
- [ ] Dashboard page
- [ ] Stake page
- [ ] Activity feed
- [ ] Stats cards

### Phase 6: Deploy ✅
- [ ] Test locally
- [ ] Deploy contract
- [ ] Deploy Envio
- [ ] Deploy Vercel
- [ ] End-to-end test

---

## 💡 Tips

1. **Giữ nguyên từ project cũ:**
   - `lib/smartAccount.ts` ✅
   - `lib/aa.ts` ✅
   - `components/MetaMaskProvider.tsx` ✅
   - Gas configuration ✅

2. **Start simple:**
   - Phase 1-6 trước
   - Phase 7 sau (optional)

3. **Test từng bước:**
   - Không code hết rồi mới test
   - Test ngay sau mỗi phase

4. **Documentation:**
   - README cho contract
   - README cho frontend
   - API docs cho Envio

---

**Ready to start?** Bắt đầu từ Phase 1 nhé! 🚀

