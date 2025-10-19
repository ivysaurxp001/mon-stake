import { parseEther, formatEther, Address, encodeFunctionData, createPublicClient, http } from 'viem';
import { publicClient } from './clients';
import type { SmartAccount } from './smartAccount-deploy';

// Staking Contract Address - Deployed on Monad Testnet
export const STAKING_CONTRACT = (process.env.NEXT_PUBLIC_STAKING_CONTRACT || '0x91e33a594da3e8e2ad3af5195611cf8cabe75353') as Address;

// Get bundler URL with API key
function getBundlerUrl(): string {
  const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
  if (!apiKey || apiKey === 'your_pimlico_api_key_here') {
    throw new Error('Pimlico API key not configured. Please add NEXT_PUBLIC_PIMLICO_API_KEY to .env.local');
  }
  return `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${apiKey}`;
}

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
    const stakeCallData = encodeFunctionData({
      abi: STAKING_ABI,
      functionName: 'stake',
      args: []
    });
    
    console.log('📋 Encoded stake function data:', stakeCallData);
    
    // Get bundler URL
    const bundlerUrl = getBundlerUrl();
    
    // Check Smart Account balance
    const balance = await smartAccount.client.getBalance({ 
      address: smartAccount.address 
    });
    console.log('💰 Smart Account balance:', formatEther(balance), 'MON');
    
    if (balance < amount + parseEther('0.01')) {
      throw new Error(`Smart Account needs more MON. Current: ${formatEther(balance)} MON. Need: ${formatEther(amount + parseEther('0.01'))} MON (stake + gas). Please fund it on /deploy page.`);
    }
    
    // Get nonce from Smart Account
    const nonceValue = await smartAccount.client.getTransactionCount({ 
      address: smartAccount.address 
    });
    
    console.log('📋 Smart Account nonce:', nonceValue);
    
    // Get current gas price
    const gasPrice = await smartAccount.client.getGasPrice();
    const maxFeePerGas = (gasPrice * 120n) / 100n; // 120% of current gas price
    const maxPriorityFeePerGas = parseEther('0.000001'); // 1 gwei
    
    console.log('⛽ Gas prices:', {
      current: formatEther(gasPrice),
      maxFee: formatEther(maxFeePerGas),
      maxPriority: formatEther(maxPriorityFeePerGas)
    });

    // IMPORTANT: ERC-4337 Smart Accounts need to wrap the call in executeBatch or similar
    // Since direct calls don't support value, we need to encode: 
    // executeBatch(address[] dest, uint256[] value, bytes[] func)
    const executeBatchCallData = encodeFunctionData({
      abi: [
        {
          name: 'executeBatch',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'dest', type: 'address[]' },
            { name: 'value', type: 'uint256[]' },
            { name: 'func', type: 'bytes[]' }
          ],
          outputs: []
        }
      ],
      functionName: 'executeBatch',
      args: [
        [STAKING_CONTRACT], // dest array
        [amount], // value array
        [stakeCallData] // func array
      ]
    });
    
    console.log('📋 ExecuteBatch call data:', executeBatchCallData);
    
    // Estimate gas using Pimlico bundler
    let estimatedGas = {
      callGasLimit: undefined as bigint | undefined,
      verificationGasLimit: undefined as bigint | undefined,
      preVerificationGas: undefined as bigint | undefined,
    };
    
    try {
      const estimateResponse = await fetch(bundlerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_estimateUserOperationGas',
          params: [
            {
              sender: smartAccount.address,
              nonce: `0x${nonceValue.toString(16)}`,
              initCode: '0x',
              callData: executeBatchCallData,
              paymasterAndData: '0x',
              signature: '0x' + '00'.repeat(65), // Dummy signature for estimation
            },
            '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' // EntryPoint v0.6
          ],
          id: 1,
        }),
      });
      
      const estimateData = await estimateResponse.json();
      
      if (estimateData.result) {
        estimatedGas.callGasLimit = BigInt(estimateData.result.callGasLimit);
        estimatedGas.verificationGasLimit = BigInt(estimateData.result.verificationGasLimit);
        estimatedGas.preVerificationGas = BigInt(estimateData.result.preVerificationGas);
        console.log('⚡ Gas estimated from bundler:', estimateData.result);
      }
    } catch (error) {
      console.warn('⚠️ Failed to estimate gas from bundler, using fallback values');
    }
    
    // Dynamic gas limits with +30% buffer
    const callGasLimit = estimatedGas.callGasLimit 
      ? estimatedGas.callGasLimit + (estimatedGas.callGasLimit * 30n / 100n)
      : 400000n;

    const verificationGasLimit = estimatedGas.verificationGasLimit
      ? estimatedGas.verificationGasLimit + (estimatedGas.verificationGasLimit * 30n / 100n)
      : 1000000n;

    const preVerificationGas = estimatedGas.preVerificationGas
      ? estimatedGas.preVerificationGas + (estimatedGas.preVerificationGas * 30n / 100n)
      : 800000n;
    
    console.log('⛽ Final gas limits (+30% buffer):', {
      callGasLimit: callGasLimit.toString(),
      verificationGasLimit: verificationGasLimit.toString(),
      preVerificationGas: preVerificationGas.toString()
    });
    
    // Create user operation with dynamic gas
    const userOperation = {
      sender: smartAccount.address,
      nonce: `0x${nonceValue.toString(16)}`,
      initCode: '0x',
      callData: executeBatchCallData,
      callGasLimit: `0x${callGasLimit.toString(16)}`,
      verificationGasLimit: `0x${verificationGasLimit.toString(16)}`, 
      preVerificationGas: `0x${preVerificationGas.toString(16)}`,
      maxFeePerGas: `0x${maxFeePerGas.toString(16)}`,
      maxPriorityFeePerGas: `0x${maxPriorityFeePerGas.toString(16)}`,
      paymasterAndData: '0x',
      signature: '0x',
    };

    console.log('📋 User Operation:', userOperation);

    // Send user operation via bundler
    const userOpResponse = await fetch(bundlerUrl, {
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
    
    if (userOpData.error) {
      console.error('❌ Bundler error:', userOpData.error);
      throw new Error(`Bundler error: ${userOpData.error.message || JSON.stringify(userOpData.error)}`);
    }
    
    const userOpHash = userOpData.result;
    console.log('✅ User Operation sent:', userOpHash);
    
    // Poll for receipt (bundler may take time)
    let receipt = null;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      
      const receiptResponse = await fetch(bundlerUrl, {
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
      
      if (receiptData.result) {
        receipt = receiptData.result;
        break;
      }
      
      console.log(`⏳ Waiting for user operation... (${i + 1}/10)`);
    }
    
    if (!receipt) {
      // Return userOpHash even if receipt not available yet
      console.log('⚠️ Receipt not available yet. Transaction may still be pending.');
      return userOpHash as `0x${string}`;
    }
    
    console.log('✅ User Operation receipt:', receipt);
    return receipt.receipt?.transactionHash || userOpHash as `0x${string}`;

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

