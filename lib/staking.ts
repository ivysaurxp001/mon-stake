import { parseEther, formatEther, Address, encodeFunctionData, encodeAbiParameters, keccak256, http } from 'viem';
import { createBundlerClient } from 'viem/account-abstraction';
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
 * Stake MON tokens using Smart Account via Bundler (Viem way)
 */
export async function stake(smartAccount: SmartAccount, amount: bigint): Promise<`0x${string}`> {
  if (STAKING_CONTRACT === '0x0000000000000000000000000000000000000000') {
    throw new Error('Staking contract not deployed. Please deploy contract first.');
  }

  console.log('🔒 Staking', formatEther(amount), 'MON');
  console.log('Smart Account Address:', smartAccount.address);
  console.log('Staking Contract:', STAKING_CONTRACT);

  // ✅ Use Viem bundlerClient.sendUserOperation() - the CORRECT way!
  if (smartAccount.implementation) {
    try {
      console.log('🚀 Using Viem bundlerClient.sendUserOperation()...');
      
      // Check Smart Account balance
      const balance = await smartAccount.client.getBalance({ 
        address: smartAccount.address 
      });
      console.log('💰 Smart Account balance:', formatEther(balance), 'MON');
      
      if (balance < amount + parseEther('0.01')) {
        throw new Error(`Smart Account needs more MON. Current: ${formatEther(balance)} MON. Need: ${formatEther(amount + parseEther('0.01'))} MON (stake + gas). Please fund it on /deploy page.`);
      }
      
      // Create bundler client
      const bundlerUrl = getBundlerUrl();
      const bundlerClient = createBundlerClient({
        client: publicClient,
        transport: http(bundlerUrl),
      });
      
      // Get gas prices
      const gasPrice = await smartAccount.client.getGasPrice();
      const maxFeePerGas = (gasPrice * 150n) / 100n; // 150% buffer
      const maxPriorityFeePerGas = parseEther('0.000001');
      
      console.log('⛽ Gas prices:', {
        maxFee: formatEther(maxFeePerGas),
        maxPriority: formatEther(maxPriorityFeePerGas)
      });
      
      // Encode stake() call
      const stakeCallData = encodeFunctionData({
        abi: STAKING_ABI,
        functionName: 'stake',
        args: []
      });
      
      console.log('📋 Sending UserOp via bundlerClient...');
      
      // Send user operation using Viem's standard method
      const userOperationHash = await bundlerClient.sendUserOperation({
        account: smartAccount.implementation, // Use MetaMask Smart Account
        calls: [
          {
            to: STAKING_CONTRACT,
            value: amount,
            data: stakeCallData,
          },
        ],
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
      
      console.log('✅ UserOperation hash:', userOperationHash);
      
      // Wait for receipt
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOperationHash,
      });
      
      console.log('✅ UserOperation receipt:', receipt);
      return receipt.receipt.transactionHash;
      
    } catch (error) {
      console.error('❌ Viem bundlerClient failed:', error);
      throw error;
    }
  }

  try {
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
    
    // EntryPoint v0.7 on Monad testnet
    const ENTRYPOINT_V07 = '0x0000000071727De22E5E9d8BAf0edAc6f37da032';
    
    // Get nonce from EntryPoint contract (more accurate for ERC-4337)
    let nonceValue: bigint;
    try {
      // Call getNonce on EntryPoint
      const nonceData = await smartAccount.client.readContract({
        address: ENTRYPOINT_V07,
        abi: [
          {
            name: 'getNonce',
            type: 'function',
            stateMutability: 'view',
            inputs: [
              { name: 'sender', type: 'address' },
              { name: 'key', type: 'uint192' }
            ],
            outputs: [{ name: 'nonce', type: 'uint256' }]
          }
        ],
        functionName: 'getNonce',
        args: [smartAccount.address, 0n] // key = 0 for default nonce sequence
      });
      nonceValue = nonceData as bigint;
      console.log('📋 Smart Account nonce from EntryPoint:', nonceValue);
    } catch (error) {
      // Fallback to transaction count
      nonceValue = await smartAccount.client.getTransactionCount({ 
        address: smartAccount.address 
      });
      console.log('📋 Smart Account nonce from RPC (fallback):', nonceValue);
    }
    
    // Get current gas price
    const gasPrice = await smartAccount.client.getGasPrice();
    const maxFeePerGas = (gasPrice * 120n) / 100n; // 120% of current gas price
    const maxPriorityFeePerGas = parseEther('0.000001'); // 1 gwei
    
    console.log('⛽ Gas prices:', {
      current: formatEther(gasPrice),
      maxFee: formatEther(maxFeePerGas),
      maxPriority: formatEther(maxPriorityFeePerGas)
    });

    // ✅ Encode call for MetaMask Smart Account execute function
    // execute(address target, uint256 value, bytes calldata data)
    const stakeCallData = encodeFunctionData({
      abi: STAKING_ABI,
      functionName: 'stake',
      args: []
    });
    
    console.log('📋 Encoded stake function data:', stakeCallData);
    
    // Encode execute function call
    const callData = encodeFunctionData({
      abi: [
        {
          name: 'execute',
          type: 'function',
          stateMutability: 'payable',
          inputs: [
            { name: 'target', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'data', type: 'bytes' }
          ],
          outputs: []
        }
      ],
      functionName: 'execute',
      args: [STAKING_CONTRACT, amount, stakeCallData]
    });
    
    console.log('📋 execute() calldata:', callData);
    
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
              // v0.7: OMIT factory/paymaster fields if not used
              callData: callData,
              callGasLimit: '0x61a80', // 400k for estimation
              verificationGasLimit: '0xf4240', // 1M for estimation
              preVerificationGas: '0xc350', // 50k for estimation
              maxFeePerGas: `0x${maxFeePerGas.toString(16)}`,
              maxPriorityFeePerGas: `0x${maxPriorityFeePerGas.toString(16)}`,
              signature: '0x' + 'ff'.repeat(65), // Dummy signature for estimation
            },
            ENTRYPOINT_V07 // v0.7
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
      } else if (estimateData.error) {
        console.warn('⚠️ Gas estimation error:', estimateData.error);
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
    
    // Create user operation v0.7 format
    // IMPORTANT: For v0.7, if not using factory/paymaster, OMIT the fields entirely!
    const userOpWithoutSig: any = {
      sender: smartAccount.address,
      nonce: `0x${nonceValue.toString(16)}`,
      // OMIT factory/factoryData for already deployed accounts (don't send '0x')
      callData: callData,
      callGasLimit: `0x${callGasLimit.toString(16)}`,
      verificationGasLimit: `0x${verificationGasLimit.toString(16)}`, 
      preVerificationGas: `0x${preVerificationGas.toString(16)}`,
      maxFeePerGas: `0x${maxFeePerGas.toString(16)}`,
      maxPriorityFeePerGas: `0x${maxPriorityFeePerGas.toString(16)}`,
      // OMIT paymaster fields (don't send '0x' or null)
      signature: '0x' as `0x${string}`,
    };
    
    // ✅ Sign userOp with EOA owner (MetaMask)
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Get EOA to sign
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const eoaAddress = accounts[0];
        
        console.log('🔐 Requesting signature from EOA:', eoaAddress);
        
        // ⚠️ Verify EOA is owner of Smart Account
        try {
          const owner = await smartAccount.client.readContract({
            address: smartAccount.address,
            abi: [
              {
                name: 'owner',
                type: 'function',
                stateMutability: 'view',
                inputs: [],
                outputs: [{ name: '', type: 'address' }]
              }
            ],
            functionName: 'owner',
          });
          console.log('👤 Smart Account owner:', owner);
          console.log('✅ EOA matches owner:', (owner as string).toLowerCase() === eoaAddress.toLowerCase());
          
          if ((owner as string).toLowerCase() !== eoaAddress.toLowerCase()) {
            throw new Error(`EOA (${eoaAddress}) is not owner of Smart Account (owner: ${owner}). Please use the correct wallet or redeploy Smart Account.`);
          }
        } catch (error) {
          console.warn('⚠️ Could not verify owner, proceeding anyway:', error);
        }
        
        // Create userOpHash according to ERC-4337 v0.7 spec
        // userOpHash = keccak256(abi.encode(userOp, entryPoint, chainId))
        const chainId = await smartAccount.client.getChainId();
        
        // Pack userOp for hashing (v0.7 format)
        const packedUserOp = encodeAbiParameters(
          [
            { name: 'sender', type: 'address' },
            { name: 'nonce', type: 'uint256' },
            { name: 'callData', type: 'bytes' },
            { name: 'callGasLimit', type: 'uint256' },
            { name: 'verificationGasLimit', type: 'uint256' },
            { name: 'preVerificationGas', type: 'uint256' },
            { name: 'maxFeePerGas', type: 'uint256' },
            { name: 'maxPriorityFeePerGas', type: 'uint256' },
          ],
          [
            userOpWithoutSig.sender as `0x${string}`,
            BigInt(userOpWithoutSig.nonce),
            userOpWithoutSig.callData as `0x${string}`,
            BigInt(userOpWithoutSig.callGasLimit),
            BigInt(userOpWithoutSig.verificationGasLimit),
            BigInt(userOpWithoutSig.preVerificationGas),
            BigInt(userOpWithoutSig.maxFeePerGas),
            BigInt(userOpWithoutSig.maxPriorityFeePerGas),
          ]
        );
        
        const userOpHashData = encodeAbiParameters(
          [
            { name: 'hashedUserOp', type: 'bytes32' },
            { name: 'entryPoint', type: 'address' },
            { name: 'chainId', type: 'uint256' },
          ],
          [
            keccak256(packedUserOp),
            ENTRYPOINT_V07,
            BigInt(chainId),
          ]
        );
        
        const userOpHash = keccak256(userOpHashData);
        
        console.log('📋 UserOpHash to sign:', userOpHash);
        console.log('📋 EntryPoint:', ENTRYPOINT_V07);
        console.log('📋 ChainId:', chainId);
        
        // Build EIP-712 typed data for UserOp v0.7
        const domain = {
          name: 'Account',
          version: '1.0.0',
          chainId: Number(chainId),
          verifyingContract: ENTRYPOINT_V07,
        };
        
        const types = {
          PackedUserOperation: [
            { name: 'sender', type: 'address' },
            { name: 'nonce', type: 'uint256' },
            { name: 'initCode', type: 'bytes32' },
            { name: 'callData', type: 'bytes32' },
            { name: 'accountGasLimits', type: 'bytes32' },
            { name: 'preVerificationGas', type: 'uint256' },
            { name: 'gasFees', type: 'bytes32' },
            { name: 'paymasterAndData', type: 'bytes32' },
          ],
        };
        
        // Pack gas limits according to v0.7 spec
        const accountGasLimits = encodeAbiParameters(
          [{ type: 'uint128' }, { type: 'uint128' }],
          [BigInt(userOpWithoutSig.verificationGasLimit), BigInt(userOpWithoutSig.callGasLimit)]
        );
        
        const gasFees = encodeAbiParameters(
          [{ type: 'uint128' }, { type: 'uint128' }],
          [BigInt(userOpWithoutSig.maxPriorityFeePerGas), BigInt(userOpWithoutSig.maxFeePerGas)]
        );
        
        const message = {
          sender: userOpWithoutSig.sender,
          nonce: BigInt(userOpWithoutSig.nonce),
          initCode: keccak256('0x'), // hash of empty initCode
          callData: keccak256(userOpWithoutSig.callData),
          accountGasLimits: keccak256(accountGasLimits),
          preVerificationGas: BigInt(userOpWithoutSig.preVerificationGas),
          gasFees: keccak256(gasFees),
          paymasterAndData: keccak256('0x'), // hash of empty paymaster
        };
        
        console.log('📋 EIP-712 domain:', domain);
        console.log('📋 EIP-712 message:', message);
        
        let signature: string;
        
        // Try EIP-712 first (recommended for Smart Accounts)
        try {
          console.log('🔐 Trying eth_signTypedData_v4 (EIP-712)...');
          signature = await window.ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [
              eoaAddress,
              JSON.stringify({
                types,
                domain,
                primaryType: 'PackedUserOperation',
                message,
              }),
            ],
          });
          console.log('✅ Signature obtained (EIP-712):', signature);
        } catch (eip712Error) {
          console.warn('⚠️ EIP-712 failed, trying personal_sign (EIP-191):', eip712Error);
          
          // Fallback to EIP-191
          try {
            signature = await window.ethereum.request({
              method: 'personal_sign',
              params: [userOpHash, eoaAddress],
            });
            console.log('✅ Signature obtained (EIP-191/personal_sign):', signature);
          } catch (personalSignError) {
            console.error('❌ All signing methods failed');
            throw personalSignError;
          }
        }
        
        // Verify hash consistency
        const hashFinal = keccak256(
          encodeAbiParameters(
            [
              { name: 'hashedUserOp', type: 'bytes32' },
              { name: 'entryPoint', type: 'address' },
              { name: 'chainId', type: 'uint256' },
            ],
            [
              keccak256(encodeAbiParameters(
                [
                  { name: 'sender', type: 'address' },
                  { name: 'nonce', type: 'uint256' },
                  { name: 'callData', type: 'bytes' },
                  { name: 'callGasLimit', type: 'uint256' },
                  { name: 'verificationGasLimit', type: 'uint256' },
                  { name: 'preVerificationGas', type: 'uint256' },
                  { name: 'maxFeePerGas', type: 'uint256' },
                  { name: 'maxPriorityFeePerGas', type: 'uint256' },
                ],
                [
                  userOpWithoutSig.sender as `0x${string}`,
                  BigInt(userOpWithoutSig.nonce),
                  userOpWithoutSig.callData as `0x${string}`,
                  BigInt(userOpWithoutSig.callGasLimit),
                  BigInt(userOpWithoutSig.verificationGasLimit),
                  BigInt(userOpWithoutSig.preVerificationGas),
                  BigInt(userOpWithoutSig.maxFeePerGas),
                  BigInt(userOpWithoutSig.maxPriorityFeePerGas),
                ]
              )),
              ENTRYPOINT_V07,
              BigInt(chainId),
            ]
          )
        );
        
        console.log('🔍 Hash consistency check:');
        console.log('   Signed hash:', userOpHash);
        console.log('   Final hash: ', hashFinal);
        console.log('   Match:', userOpHash.toLowerCase() === hashFinal.toLowerCase() ? '✅ YES' : '❌ NO - WILL FAIL AA24!');
        
        userOpWithoutSig.signature = signature as `0x${string}`;
      } catch (error) {
        console.error('❌ Failed to get signature:', error);
        throw new Error('User rejected signature request or signing failed');
      }
    }
    
    const userOperation = userOpWithoutSig;

    console.log('📋 User Operation:', userOperation);

    // Send user operation via bundler (use v0.7 EntryPoint)
    const userOpResponse = await fetch(bundlerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_sendUserOperation',
        params: [
          userOperation,
          ENTRYPOINT_V07 // EntryPoint v0.7
        ],
        id: 1,
      }),
    });
    
    const userOpData = await userOpResponse.json();
    
    if (userOpData.error) {
      console.error('❌ Bundler error:', userOpData.error);
      console.error('📋 UserOp that failed:', userOperation);
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
 * Unstake MON tokens using Smart Account via Bundler
 */
export async function unstake(smartAccount: SmartAccount, amount: bigint): Promise<`0x${string}`> {
  if (STAKING_CONTRACT === '0x0000000000000000000000000000000000000000') {
    throw new Error('Staking contract not deployed. Please deploy contract first.');
  }

  console.log('🔓 Unstaking', formatEther(amount), 'MON');
  console.log('Smart Account Address:', smartAccount.address);
  console.log('Staking Contract:', STAKING_CONTRACT);

  // ✅ Use Viem bundlerClient.sendUserOperation() - the CORRECT way!
  if (smartAccount.implementation) {
    try {
      console.log('🚀 Using Viem bundlerClient.sendUserOperation() for unstake...');
      
      // Create bundler client
      const bundlerUrl = getBundlerUrl();
      const bundlerClient = createBundlerClient({
        client: publicClient,
        transport: http(bundlerUrl),
      });
      
      // Get gas prices
      const gasPrice = await smartAccount.client.getGasPrice();
      const maxFeePerGas = (gasPrice * 150n) / 100n; // 150% buffer
      const maxPriorityFeePerGas = parseEther('0.000001');
      
      console.log('⛽ Gas prices:', {
        maxFee: formatEther(maxFeePerGas),
        maxPriority: formatEther(maxPriorityFeePerGas)
      });
      
      // Encode unstake() call
      const unstakeCallData = encodeFunctionData({
        abi: STAKING_ABI,
        functionName: 'unstake',
        args: [amount]
      });
      
      console.log('📋 Sending UserOp via bundlerClient for unstake...');
      
      // Send user operation using Viem's standard method
      const userOperationHash = await bundlerClient.sendUserOperation({
        account: smartAccount.implementation, // Use MetaMask Smart Account
        calls: [
          {
            to: STAKING_CONTRACT,
            value: 0n, // No value for unstake
            data: unstakeCallData,
          },
        ],
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
      
      console.log('✅ UserOperation hash:', userOperationHash);
      
      // Wait for receipt
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOperationHash,
      });
      
      console.log('✅ UserOperation receipt:', receipt);
      return receipt.receipt.transactionHash;
      
    } catch (error) {
      console.error('❌ Viem bundlerClient failed for unstake:', error);
      throw error;
    }
  }

  throw new Error('Smart Account implementation not available');
}

/**
 * Claim rewards using Smart Account via Bundler
 */
export async function claimRewards(smartAccount: SmartAccount): Promise<`0x${string}`> {
  if (STAKING_CONTRACT === '0x0000000000000000000000000000000000000000') {
    throw new Error('Staking contract not deployed. Please deploy contract first.');
  }

  console.log('🎁 Claiming rewards');
  console.log('Smart Account Address:', smartAccount.address);
  console.log('Staking Contract:', STAKING_CONTRACT);

  // ✅ Use Viem bundlerClient.sendUserOperation() - the CORRECT way!
  if (smartAccount.implementation) {
    try {
      console.log('🚀 Using Viem bundlerClient.sendUserOperation() for claim rewards...');
      
      // Create bundler client
      const bundlerUrl = getBundlerUrl();
      const bundlerClient = createBundlerClient({
        client: publicClient,
        transport: http(bundlerUrl),
      });
      
      // Get gas prices
      const gasPrice = await smartAccount.client.getGasPrice();
      const maxFeePerGas = (gasPrice * 150n) / 100n; // 150% buffer
      const maxPriorityFeePerGas = parseEther('0.000001');
      
      console.log('⛽ Gas prices:', {
        maxFee: formatEther(maxFeePerGas),
        maxPriority: formatEther(maxPriorityFeePerGas)
      });
      
      // Encode claimRewards() call
      const claimCallData = encodeFunctionData({
        abi: STAKING_ABI,
        functionName: 'claimRewards',
        args: []
      });
      
      console.log('📋 Sending UserOp via bundlerClient for claim rewards...');
      
      // Send user operation using Viem's standard method
      const userOperationHash = await bundlerClient.sendUserOperation({
        account: smartAccount.implementation, // Use MetaMask Smart Account
        calls: [
          {
            to: STAKING_CONTRACT,
            value: 0n, // No value for claim
            data: claimCallData,
          },
        ],
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
      
      console.log('✅ UserOperation hash:', userOperationHash);
      
      // Wait for receipt
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOperationHash,
      });
      
      console.log('✅ UserOperation receipt:', receipt);
      return receipt.receipt.transactionHash;
      
    } catch (error) {
      console.error('❌ Viem bundlerClient failed for claim rewards:', error);
      throw error;
    }
  }

  throw new Error('Smart Account implementation not available');
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

