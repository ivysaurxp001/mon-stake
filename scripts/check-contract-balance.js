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

async function checkContractBalance() {
  console.log('🔍 Checking contract balance...');
  console.log('Contract:', STAKING_CONTRACT);

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
  });

  try {
    // Check contract balance
    const balance = await publicClient.getBalance({
      address: STAKING_CONTRACT,
    });

    console.log('💰 Contract Balance:', formatEther(balance), 'MON');

    if (balance === 0n) {
      console.log('⚠️  WARNING: Contract has no MON!');
      console.log('📝 Please send MON to contract for rewards:');
      console.log(`   Address: ${STAKING_CONTRACT}`);
      console.log('   Amount: 100+ MON recommended');
    } else {
      console.log('✅ Contract is funded and ready!');
    }

    // Check if contract is deployed
    const code = await publicClient.getCode({
      address: STAKING_CONTRACT,
    });

    if (code === '0x') {
      console.log('❌ Contract not deployed!');
    } else {
      console.log('✅ Contract is deployed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkContractBalance();

