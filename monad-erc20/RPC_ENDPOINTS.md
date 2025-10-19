# Monad Testnet RPC Endpoints

## Current Issue
Fastlane RPC returning error: "stake weighted qos is not available"

## Available RPC Endpoints to Try

### 1. Official Monad RPC
```
https://testnet.monad.xyz/rpc
```

### 2. Ankr RPC
```
https://rpc.ankr.com/monad_testnet
```

### 3. Get Your Own RPC from Monad
Visit: https://docs.monad.xyz/devnet/rpc
- Register for API key
- Get personal RPC endpoint

### 4. Alternative Public RPCs
Check Monad Discord or docs for latest working RPCs.

## How to Update RPC

Edit `monad-erc20/.env`:
```env
MONAD_RPC_URL=<NEW_RPC_URL_HERE>
```

Then retry deployment.

