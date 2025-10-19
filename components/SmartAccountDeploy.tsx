"use client";

import { useState } from "react";
import { useMetaMask } from "./MetaMaskProvider";

export default function SmartAccountDeploy() {
  const { smartAccount, connect } = useMetaMask();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployTx, setDeployTx] = useState<string | null>(null);
  const [isDeployed, setIsDeployed] = useState(false);

  const handleDeploy = async () => {
    if (!smartAccount) {
      await connect();
      return;
    }

    if (isDeployed) {
      alert("Smart Account already deployed!");
      return;
    }

    setIsDeploying(true);
    try {
      const txHash = await smartAccount.deploy();
      setDeployTx(txHash);
      setIsDeployed(true);
      console.log("✅ Smart Account deployed:", txHash);
    } catch (error) {
      console.error("❌ Deployment failed:", error);
      alert("Deployment failed: " + (error as Error).message);
    } finally {
      setIsDeploying(false);
    }
  };


  const handleCheckSmartAccountStatus = async () => {
    if (!smartAccount) return;

    try {
      const status = await smartAccount.checkSmartAccountStatus();
      console.log("📋 Smart Account Status:", status);
      
      // Update deployment status based on check result
      setIsDeployed(status.isDeployed);
      
      alert(`Smart Account Status:\nAddress: ${status.address}\nHas Bytecode: ${status.hasBytecode}\nBytecode Length: ${status.bytecodeLength}\nIs Deployed: ${status.isDeployed}`);
    } catch (error) {
      console.error("❌ Failed to check Smart Account status:", error);
    }
  };

  const handleTryAutomaticDeployment = async () => {
    if (!smartAccount) return;

    setIsDeploying(true);
    try {
      const txHash = await smartAccount.tryAutomaticDeployment();
      setDeployTx(txHash);
      
      // Assume deployed if transaction succeeded
      setIsDeployed(true);
      
      console.log("✅ Automatic deployment successful:", txHash);
    } catch (error) {
      console.error("❌ Automatic deployment failed:", error);
      alert("Automatic deployment failed: " + (error as Error).message);
    } finally {
      setIsDeploying(false);
    }
  };

  if (!smartAccount) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl mb-6 shadow-lg">
            <span className="text-2xl">🏦</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Smart Account
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Connect MetaMask to deploy your Smart Account and unlock advanced staking features
          </p>
          <button
            onClick={connect}
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="mr-2">🦊</span>
            Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
          <span className="text-white text-xl">🏦</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Smart Account</h3>
          <p className="text-gray-600 text-sm">Deploy and manage your Smart Account</p>
        </div>
      </div>
      
      <div className="space-y-6 mb-8">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Address</span>
            <span className="text-xs text-gray-500">Deterministic</span>
          </div>
          <p className="font-mono text-sm bg-white p-3 rounded-lg border break-all text-gray-800">
            {smartAccount.address}
          </p>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              isDeployed ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm font-semibold text-gray-700">Status</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isDeployed 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isDeployed ? '✅ Deployed' : '⏳ Not Deployed'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleCheckSmartAccountStatus}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <span className="mr-2">🔬</span>
          Check Smart Account Status
        </button>
        
        <button
          onClick={handleTryAutomaticDeployment}
          disabled={isDeploying}
          className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg ${
            isDeploying
              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          <span className="mr-2">⚡</span>
          {isDeploying ? 'Deploying...' : 'Try Automatic Deployment'}
        </button>
      </div>

      {deployTx && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-sm font-semibold text-green-800">Deployed Successfully!</p>
          </div>
          <p className="text-xs text-green-600 mb-2">Transaction Hash:</p>
          <a
            href={`https://testnet-explorer.monad.xyz/tx/${deployTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs bg-white p-2 rounded-lg border break-all text-blue-600 hover:underline block"
          >
            {deployTx}
          </a>
        </div>
      )}


      {isDeployed && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs">🎉</span>
            </div>
            <p className="text-sm font-semibold text-purple-800">
              Smart Account is ready for staking!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
