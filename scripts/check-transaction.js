const { createPublicClient, http, formatEther } = require('viem');

async function checkTransaction() {
  console.log('🔍 Checking transaction details...');
  
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
  
  try {
    // Get latest block to find recent transactions
    const latestBlock = await client.getBlock();
    console.log('📦 Latest block:', latestBlock.number);
    
    // Check if any transactions are to our contract
    const contractAddress = '0x91e33a594da3e8e2ad3af5195611cf8cabe75353';
    const userAddress = '0x963a2d0be2eb5d785c6e73ec904fce8d65691773';
    
    console.log('🔍 Looking for transactions to contract:', contractAddress);
    console.log('👤 From user:', userAddress);
    
    // Check recent transactions
    for (let i = 0; i < Math.min(10, latestBlock.transactions.length); i++) {
      const txHash = latestBlock.transactions[i];
      const tx = await client.getTransaction({ hash: txHash });
      
      if (tx.to && tx.to.toLowerCase() === contractAddress.toLowerCase() && 
          tx.from && tx.from.toLowerCase() === userAddress.toLowerCase()) {
        console.log('✅ Found matching transaction!');
        console.log('📋 Transaction details:', {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: formatEther(tx.value),
          data: tx.data,
          blockNumber: tx.blockNumber
        });
        
        // Check if it's a stake transaction (no data = stake function)
        if (tx.data === '0x' || tx.data === '0x0') {
          console.log('🎯 This is a STAKE transaction (no function data)');
        } else {
          console.log('⚠️ This transaction has function data:', tx.data);
        }
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTransaction();
