import { parseEther, formatEther, Address, encodeFunctionData, createPublicClient, http } from 'viem';
import { publicClient } from './clients';
import type { SmartAccount } from './smartAccount-deploy';

// Staking Contract Address - Deployed on Monad Testnet
export const STAKING_CONTRACT = (process.env.NEXT_PUBLIC_STAKING_CONTRACT || '0x91e33a594da3e8e2ad3af5195611cf8cabe75353') as Address;

// Bundler client for user operations
const bundlerClient = createPublicClient({
  chain: publicClient.chain,
  transport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC_URL || 'https://api.pimlico.io/v2/monad-testnet/rpc'),
});

/**
 * MonStaking Contract ABI
 */
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
  {
    name: 'stakes',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'rewards',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
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
] as const;

/**
 * Stake info interface
 */
export interface StakeInfo {
  stakedAmount: bigint;
  pendingRewards: bigint;
  lockEndsAt: bigint;
  canUnstake: boolean;
}

/**
 * Get staking info for a user
 */
export async function getStakeInfo(userAddress: Address): Promise<StakeInfo> {
  console.log('🔍 Getting stake info for:', userAddress);
  console.log('📋 Contract address:', STAKING_CONTRACT);

  if (STAKING_CONTRACT === '0x0000000000000000000000000000000000000000') {
    console.warn('⚠️ Staking contract not deployed yet');
    return {
      stakedAmount: 0n,
      pendingRewards: 0n,
      lockEndsAt: 0n,
      canUnstake: false
    };
  }

  try {
    console.log('📞 Calling contract...');
    const result = await publicClient.readContract({
      address: STAKING_CONTRACT,
      abi: STAKING_ABI,
      functionName: 'getStakeInfo',
      args: [userAddress]
    });

    console.log('✅ Contract response:', result);

    const stakeInfo = {
      stakedAmount: result[0],
      pendingRewards: result[1],
      lockEndsAt: result[2],
      canUnstake: result[3]
    };

    console.log('📊 Parsed stake info:', {
      stakedAmount: formatEther(stakeInfo.stakedAmount),
      pendingRewards: formatEther(stakeInfo.pendingRewards),
      lockEndsAt: new Date(Number(stakeInfo.lockEndsAt) * 1000).toLocaleString(),
      canUnstake: stakeInfo.canUnstake
    });

    return stakeInfo;
  } catch (error) {
    console.error('❌ Failed to get stake info:', error);
    throw error;
  }
}

/**
 * Stake MON tokens using Smart Account via Bundler
 */
export async function stake(smartAccount: SmartAccount, amount: bigint): Promise<`0x${string}`> {
  if (STAKING_CONTRACT === '0x0000000000000000000000000000000000000000') {
    throw new Error('Staking contract not deployed. Please deploy contract first.');
  }

  console.log('🔒 Staking', formatEther(amount), 'MON');
  console.log('Smart Account Address:', smartAccount.address);
  console.log('Staking Contract:', STAKING_CONTRACT);

  try {
    // Encode stake() function call
    const data = encodeFunctionData({
      abi: STAKING_ABI,
      functionName: 'stake',
      args: []
    });
    
    console.log('📋 Encoded stake function data:', data);
    
    // Get nonce from bundler
    const nonceResponse = await fetch(process.env.NEXT_PUBLIC_BUNDLER_RPC_URL || 'https://api.pimlico.io/v2/monad-testnet/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [smartAccount.address, 'latest'],
        id: 1,
      }),
    });
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.result;

    // Create user operation
    const userOperation = {
      sender: smartAccount.address,
      nonce: nonce,
      callData: data,
      callGasLimit: '0x186A0', // 100000
      verificationGasLimit: '0x186A0', // 100000
      preVerificationGas: '0x5208', // 21000
      maxFeePerGas: '0x38D7EA4C68000', // 0.001 ETH in wei
      maxPriorityFeePerGas: '0x5AF3107A4000', // 0.0001 ETH in wei
      paymasterAndData: '0x',
      signature: '0x',
    };

    console.log('📋 User Operation:', userOperation);

    // Send user operation via bundler RPC
    const userOpResponse = await fetch(process.env.NEXT_PUBLIC_BUNDLER_RPC_URL || 'https://api.pimlico.io/v2/monad-testnet/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_sendUserOperation',
        params: [
          userOperation,
          '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' // EntryPoint v0.6
        ],
        id: 1,
      }),
    });
    const userOpData = await userOpResponse.json();
    const userOpHash = userOpData.result;

    console.log('✅ User Operation sent:', userOpHash);
    
    // Wait for user operation to be mined
    const receiptResponse = await fetch(process.env.NEXT_PUBLIC_BUNDLER_RPC_URL || 'https://api.pimlico.io/v2/monad-testnet/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getUserOperationReceipt',
        params: [userOpHash],
        id: 1,
      }),
    });
    const receiptData = await receiptResponse.json();
    const receipt = receiptData.result;

    console.log('✅ User Operation receipt:', receipt);
    return receipt.receipt.transactionHash;

  } catch (error) {
    console.error('❌ Stake failed:', error);
    throw error;
  }
}

/**
 * Unstake MON tokens
 */
export async function unstake(smartAccount: SmartAccount, amount: bigint): Promise<`0x${string}`> {
  if (STAKING_CONTRACT === '0x0000000000000000000000000000000000000000') {
    throw new Error('Staking contract not deployed. Please deploy contract first.');
  }

  console.log('🔓 Unstaking', formatEther(amount), 'MON');

  try {
    // Encode unstake function call
    const data = encodeFunctionData({
      abi: STAKING_ABI,
      functionName: 'unstake',
      args: [amount]
    });

    // For browser environment with MetaMask
    if (typeof window !== 'undefined' && window.ethereum) {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: smartAccount.address,
          to: STAKING_CONTRACT,
          value: '0x0',
          data,
        }],
      });
      
      console.log('✅ Unstake transaction sent:', txHash);
      return txHash as `0x${string}`;
    }

    throw new Error('Please use MetaMask in browser to unstake');
  } catch (error) {
    console.error('❌ Unstake failed:', error);
    throw error;
  }
}

/**
 * Claim rewards without unstaking
 */
export async function claimRewards(smartAccount: SmartAccount): Promise<`0x${string}`> {
  if (STAKING_CONTRACT === '0x0000000000000000000000000000000000000000') {
    throw new Error('Staking contract not deployed. Please deploy contract first.');
  }

  console.log('🎁 Claiming rewards');

  try {
    // Encode claimRewards function call
    const data = encodeFunctionData({
      abi: STAKING_ABI,
      functionName: 'claimRewards',
      args: []
    });

    // For browser environment with MetaMask
    if (typeof window !== 'undefined' && window.ethereum) {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: smartAccount.address,
          to: STAKING_CONTRACT,
          value: '0x0',
          data,
        }],
      });
      
      console.log('✅ Claim transaction sent:', txHash);
      return txHash as `0x${string}`;
    }

    throw new Error('Please use MetaMask in browser to claim rewards');
  } catch (error) {
    console.error('❌ Claim failed:', error);
    throw error;
  }
}

/**
 * Format stake info for display
 */
export function formatStakeInfo(info: StakeInfo) {
  return {
    stakedAmount: formatEther(info.stakedAmount),
    pendingRewards: formatEther(info.pendingRewards),
    lockEndsAt: new Date(Number(info.lockEndsAt) * 1000).toLocaleString(),
    canUnstake: info.canUnstake,
  };
}

/**
 * Calculate APY percentage
 */
export function calculateAPY(stakedAmount: bigint, rewards: bigint, daysStaked: number): number {
  if (stakedAmount === 0n || daysStaked === 0) return 0;
  
  const rewardsNum = Number(formatEther(rewards));
  const stakedNum = Number(formatEther(stakedAmount));
  
  // APY = (rewards / staked) * (365 / days) * 100
  return (rewardsNum / stakedNum) * (365 / daysStaked) * 100;
}

/**
 * Constants
 */
export const STAKING_CONSTANTS = {
  REWARD_RATE: 10, // 10% APY
  MIN_STAKE: parseEther('0.1'), // 0.1 MON
  LOCK_PERIOD: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

