const { createPublicClient, http, formatEther } = require('viem');

// Define Monad testnet
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/monad_testnet'],
    },
  },
};

const STAKING_CONTRACT = '0x91e33a594da3e8e2ad3af5195611cf8cabe75353';

// ABI for getStakeInfo function
const STAKING_ABI = [
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
  }
];

async function checkUserStake(userAddress) {
  console.log('🔍 Checking stake info for user:', userAddress);
  console.log('📋 Contract address:', STAKING_CONTRACT);

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
  });

  try {
    const result = await publicClient.readContract({
      address: STAKING_CONTRACT,
      abi: STAKING_ABI,
      functionName: 'getStakeInfo',
      args: [userAddress]
    });

    console.log('✅ Contract response:', result);

    const [stakedAmount, pendingRewards, lockEndsAt, canUnstake] = result;

    console.log('📊 Stake Info:');
    console.log('  Staked Amount:', formatEther(stakedAmount), 'MON');
    console.log('  Pending Rewards:', formatEther(pendingRewards), 'MON');
    console.log('  Lock Ends At:', new Date(Number(lockEndsAt) * 1000).toLocaleString());
    console.log('  Can Unstake:', canUnstake);

    if (stakedAmount > 0n) {
      console.log('✅ User has staked tokens!');
    } else {
      console.log('❌ User has no staked tokens');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get user address from command line argument
const userAddress = process.argv[2];

if (!userAddress) {
  console.log('Usage: node check-user-stake.js <USER_ADDRESS>');
  console.log('Example: node check-user-stake.js 0xd8FF12Afb233f53666a22373e864c3e23DcF7495');
  process.exit(1);
}

checkUserStake(userAddress);

