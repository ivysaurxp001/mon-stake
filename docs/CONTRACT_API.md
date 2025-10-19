# 📚 MonStaking Contract API Documentation

## Contract Address

**Monad Testnet:** `TBD - Update after deployment`

## Constants

| Name | Value | Description |
|------|-------|-------------|
| `REWARD_RATE` | 10 | Annual Percentage Yield (10%) |
| `MIN_STAKE` | 0.1 MON | Minimum amount required to stake |
| `LOCK_PERIOD` | 7 days | Time tokens are locked after staking |

## Functions

### `stake()` - Public, Payable

Stake MON tokens to start earning rewards.

**Parameters:** None (send MON with transaction)

**Requirements:**
- `msg.value >= MIN_STAKE` (0.1 MON)

**Events Emitted:**
- `Staked(user, amount, timestamp)`

**Example:**
```javascript
// Stake 1 MON
await contract.stake({ value: parseEther('1') });
```

---

### `unstake(uint256 amount)` - Public

Unstake tokens and claim all accumulated rewards.

**Parameters:**
- `amount` (uint256): Amount to unstake in wei

**Requirements:**
- User has sufficient staked amount
- Lock period has expired (7 days since last stake)

**Events Emitted:**
- `Unstaked(user, amount, reward, timestamp)`

**Example:**
```javascript
// Unstake all
const staked = await contract.stakes(userAddress);
await contract.unstake(staked);
```

---

### `claimRewards()` - Public

Claim accumulated rewards without unstaking.

**Parameters:** None

**Requirements:**
- User has rewards available

**Events Emitted:**
- `RewardClaimed(user, amount, timestamp)`

**Example:**
```javascript
// Claim rewards
await contract.claimRewards();
```

---

### `getStakeInfo(address user)` - View

Get complete staking information for a user.

**Parameters:**
- `user` (address): User address to query

**Returns:**
- `stakedAmount` (uint256): Total amount staked
- `pendingRewards` (uint256): Unclaimed rewards
- `lockEndsAt` (uint256): Timestamp when unlock happens
- `canUnstake` (bool): Whether user can unstake now

**Example:**
```javascript
const [staked, rewards, lockEnd, canUnstake] = await contract.getStakeInfo(userAddress);
console.log('Staked:', formatEther(staked), 'MON');
console.log('Rewards:', formatEther(rewards), 'MON');
console.log('Can Unstake:', canUnstake);
```

---

### `stakes(address user)` - View

Get staked amount for a user.

**Parameters:**
- `user` (address): User address

**Returns:**
- (uint256): Amount staked

---

### `rewards(address user)` - View

Get accumulated rewards for a user.

**Parameters:**
- `user` (address): User address

**Returns:**
- (uint256): Reward amount

---

### `stakingTime(address user)` - View

Get last staking timestamp for a user.

**Parameters:**
- `user` (address): User address

**Returns:**
- (uint256): Unix timestamp

---

### `getContractBalance()` - View

Get total MON balance in contract (for rewards pool).

**Parameters:** None

**Returns:**
- (uint256): Contract balance in wei

**Example:**
```javascript
const balance = await contract.getContractBalance();
console.log('Rewards Pool:', formatEther(balance), 'MON');
```

---

## Events

### `Staked`

Emitted when user stakes tokens.

**Parameters:**
- `user` (address, indexed): User who staked
- `amount` (uint256): Amount staked
- `timestamp` (uint256): Block timestamp

---

### `Unstaked`

Emitted when user unstakes tokens.

**Parameters:**
- `user` (address, indexed): User who unstaked
- `amount` (uint256): Amount unstaked
- `reward` (uint256): Reward amount claimed
- `timestamp` (uint256): Block timestamp

---

### `RewardClaimed`

Emitted when user claims rewards.

**Parameters:**
- `user` (address, indexed): User who claimed
- `amount` (uint256): Reward amount
- `timestamp` (uint256): Block timestamp

---

## Reward Calculation

Rewards are calculated using this formula:

```
reward = (stakedAmount × REWARD_RATE × timeElapsed) / (365 days × 100)
```

Where:
- `stakedAmount`: Amount user has staked
- `REWARD_RATE`: 10 (for 10% APY)
- `timeElapsed`: Seconds since last stake/claim
- `365 days`: Seconds in a year (31,536,000)

**Example:**

If user stakes 100 MON for 30 days:
```
reward = (100 × 10 × 2,592,000) / (31,536,000 × 100)
       = 2,592,000,000 / 3,153,600,000
       ≈ 0.82 MON
```

---

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `"Min stake is 0.1 MON"` | Stake amount too low | Stake at least 0.1 MON |
| `"Insufficient stake"` | Trying to unstake more than staked | Check staked amount |
| `"Still locked"` | Lock period not expired | Wait until lock expires |
| `"No rewards"` | No rewards to claim | Stake tokens and wait |
| `"Transfer failed"` | ETH transfer failed | Check contract has funds |

---

## Security Considerations

1. **Reentrancy Protection**: Uses checks-effects-interactions pattern
2. **Integer Overflow**: Solidity 0.8.20 has built-in overflow protection
3. **Access Control**: No admin functions, fully decentralized
4. **Time Lock**: 7-day lock prevents manipulation
5. **Safe Transfers**: Uses low-level call with success check

---

## Gas Estimates

Approximate gas costs on Monad testnet:

| Function | Gas Used | Cost (25 gwei) |
|----------|----------|----------------|
| `stake()` | ~80,000 | 0.002 MON |
| `unstake()` | ~100,000 | 0.0025 MON |
| `claimRewards()` | ~90,000 | 0.00225 MON |
| `getStakeInfo()` | ~30,000 (view) | Free |

---

## Integration Example

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { monadTestnet } from './chains';
import { STAKING_ABI } from './staking';

const STAKING_CONTRACT = '0x...'; // Your deployed contract

// Create clients
const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http()
});

const walletClient = createWalletClient({
  chain: monadTestnet,
  transport: http()
});

// Stake 1 MON
const hash = await walletClient.writeContract({
  address: STAKING_CONTRACT,
  abi: STAKING_ABI,
  functionName: 'stake',
  value: parseEther('1'),
});

// Get stake info
const info = await publicClient.readContract({
  address: STAKING_CONTRACT,
  abi: STAKING_ABI,
  functionName: 'getStakeInfo',
  args: [userAddress]
});
```

---

## Testing

See `test/` directory for comprehensive test suite.

Run tests:
```bash
npx hardhat test
```


