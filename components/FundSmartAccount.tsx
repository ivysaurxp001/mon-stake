'use client';

import { useState } from "react";
import { useMetaMask } from "./MetaMaskProvider";
import { parseEther, formatEther } from "viem";

export default function FundSmartAccount() {
  const { smartAccount } = useMetaMask();
  const [amount, setAmount] = useState("0.5");
  const [isSending, setIsSending] = useState(false);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const checkBalance = async () => {
    if (!smartAccount || typeof window === 'undefined' || !window.ethereum) return;

    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [smartAccount.address, 'latest'],
      });
      
      const balanceValue = BigInt(balanceHex as string);
      setBalance(balanceValue);
      console.log('💰 Smart Account balance:', formatEther(balanceValue), 'MON');
    } catch (error) {
      console.error('❌ Failed to check balance:', error);
    }
  };

  const handleFund = async () => {
    if (!smartAccount || typeof window === 'undefined' || !window.ethereum) return;

    setIsSending(true);
    setTxHash(null);

    try {
      const amountWei = parseEther(amount);
      
      // Get EOA address
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const eoaAddress = accounts[0];

      console.log('💸 Sending', amount, 'MON from EOA to Smart Account...');
      console.log('👤 From:', eoaAddress);
      console.log('🏦 To:', smartAccount.address);

      // Send MON from EOA to Smart Account
      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: eoaAddress,
          to: smartAccount.address,
          value: `0x${amountWei.toString(16)}`,
        }],
      });

      setTxHash(hash as string);
      console.log('✅ Transfer successful:', hash);

      // Wait a bit then check balance
      setTimeout(() => checkBalance(), 2000);
    } catch (error) {
      console.error('❌ Transfer failed:', error);
      alert('Transfer failed: ' + (error as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  if (!smartAccount) {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
          <span className="text-white text-xl">💰</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Fund Smart Account</h3>
          <p className="text-gray-600 text-sm">Add MON to pay for gas fees</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Smart Account Balance</span>
            <button
              onClick={checkBalance}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              🔄 Refresh
            </button>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {balance !== null ? `${formatEther(balance)} MON` : 'Click refresh'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Amount to Send (MON)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.1"
            min="0"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
            placeholder="0.5"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Recommended: 0.5 MON for gas fees
          </p>
        </div>

        <button
          onClick={handleFund}
          disabled={isSending || !amount || parseFloat(amount) <= 0}
          className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg ${
            isSending || !amount || parseFloat(amount) <= 0
              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          <span className="mr-2">💸</span>
          {isSending ? 'Sending...' : `Send ${amount} MON to Smart Account`}
        </button>
      </div>

      {txHash && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-sm font-semibold text-green-800">Transfer Successful!</p>
          </div>
          <p className="text-xs text-green-600 mb-2">Transaction Hash:</p>
          <a
            href={`https://testnet-explorer.monad.xyz/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs bg-white p-2 rounded-lg border break-all text-blue-600 hover:underline block"
          >
            {txHash}
          </a>
        </div>
      )}
    </div>
  );
}

