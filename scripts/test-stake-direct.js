const { createPublicClient, http, formatEther, parseEther } = require('viem');

async function testStakeDirect() {
  console.log('🧪 Testing stake function directly...');
  
  const client = createPublicClient({
    chain: {
      id: 10143,
      name: "Monad Testnet", 
      network: "monad-testnet",
      nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
      rpcUrls: { 
        default: { http: ["https://rpc.ankr.com/monad_testnet"] }
      },
    },
    transport: http('https://rpc.ankr.com/monad_testnet')
  });
  
  const contractAddress = '0x91e33a594da3e8e2ad3af5195611cf8cabe75353';
  const userAddress = '0x963a2d0be2eb5d785c6e73ec904fce8d65691773';
  
  try {
    // Test getStakeInfo function
    console.log('📞 Calling getStakeInfo...');
    const stakeInfo = await client.readContract({
      address: contractAddress,
      abi: [{
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
      }],
      functionName: 'getStakeInfo',
      args: [userAddress]
    });
    
    console.log('✅ getStakeInfo result:', {
      stakedAmount: formatEther(stakeInfo[0]),
      pendingRewards: formatEther(stakeInfo[1]),
      lockEndsAt: new Date(Number(stakeInfo[2]) * 1000).toLocaleString(),
      canUnstake: stakeInfo[3]
    });
    
    // Test stakes mapping directly
    console.log('📞 Calling stakes mapping...');
    const stakes = await client.readContract({
      address: contractAddress,
      abi: [{
        name: 'stakes',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
      }],
      functionName: 'stakes',
      args: [userAddress]
    });
    
    console.log('✅ stakes mapping result:', formatEther(stakes));
    
    // Check contract balance
    const contractBalance = await client.getBalance({
      address: contractAddress
    });
    console.log('💰 Contract balance:', formatEther(contractBalance));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testStakeDirect();
