# Envio Configuration for MonStaking Contract

## Contract Information

### Contract Address
```
0x91e33a594da3e8e2ad3af5195611cf8cabe75353
```

### Network
```
Monad Testnet
```

### Contract Name
```
MonStaking
```

## Events to Index

### 1. Staked Event
- **Event Name**: `Staked`
- **Indexed Parameters**: `user` (address)
- **Non-indexed Parameters**: `amount` (uint256), `timestamp` (uint256)

### 2. Unstaked Event
- **Event Name**: `Unstaked`
- **Indexed Parameters**: `user` (address)
- **Non-indexed Parameters**: `amount` (uint256), `reward` (uint256), `timestamp` (uint256)

### 3. RewardClaimed Event
- **Event Name**: `RewardClaimed`
- **Indexed Parameters**: `user` (address)
- **Non-indexed Parameters**: `amount` (uint256), `timestamp` (uint256)

## Suggested GraphQL Schema

```graphql
type Staked @entity {
  id: ID!
  user: String!
  amount: BigInt!
  timestamp: BigInt!
  transactionHash: String!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
}

type Unstaked @entity {
  id: ID!
  user: String!
  amount: BigInt!
  reward: BigInt!
  timestamp: BigInt!
  transactionHash: String!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
}

type RewardClaimed @entity {
  id: ID!
  user: String!
  amount: BigInt!
  timestamp: BigInt!
  transactionHash: String!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
}
```

## Example Queries

### User Staking History
```graphql
query UserStakingHistory($user: String!) {
  stakeds(where: { user: $user }, orderBy: timestamp, orderDirection: desc) {
    id
    amount
    timestamp
    transactionHash
  }
  
  unstakeds(where: { user: $user }, orderBy: timestamp, orderDirection: desc) {
    id
    amount
    reward
    timestamp
    transactionHash
  }
  
  rewardClaimeds(where: { user: $user }, orderBy: timestamp, orderDirection: desc) {
    id
    amount
    timestamp
    transactionHash
  }
}
```

### Total Staking Stats
```graphql
query StakingStats {
  totalStaked: stakeds {
    amount
  }
  
  totalUnstaked: unstakeds {
    amount
  }
  
  totalRewardsClaimed: rewardClaimeds {
    amount
  }
}
```

### Recent Activity
```graphql
query RecentActivity($limit: Int!) {
  stakeds(orderBy: timestamp, orderDirection: desc, first: $limit) {
    user
    amount
    timestamp
    transactionHash
  }
  
  unstakeds(orderBy: timestamp, orderDirection: desc, first: $limit) {
    user
    amount
    reward
    timestamp
    transactionHash
  }
  
  rewardClaimeds(orderBy: timestamp, orderDirection: desc, first: $limit) {
    user
    amount
    timestamp
    transactionHash
  }
}
```

## Files Available

1. `MonStaking.abi.json` - Complete ABI with all functions and events
2. `MonStaking.events.abi.json` - Events only ABI for Envio indexing
3. `MonStaking.sol` - Source contract code

## Usage Instructions

1. Use `MonStaking.events.abi.json` for Envio event indexing
2. Use the GraphQL schema above for your Envio schema
3. Configure your Envio project with the contract address and network
4. Deploy and start indexing events
5. Use the example queries to fetch data in your frontend
