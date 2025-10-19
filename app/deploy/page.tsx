import SmartAccountDeploy from "@/components/SmartAccountDeploy";

export default function DeployPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <span className="text-3xl">🏦</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Deploy Smart Account
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Deploy your Smart Account to enable advanced staking features and gasless transactions on Monad testnet.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Deploy Component - Takes 2 columns */}
            <div className="lg:col-span-2">
              <SmartAccountDeploy />
            </div>

            {/* Benefits Panel - Takes 1 column */}
            <div className="space-y-6">
              {/* Benefits Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                    <span className="text-white text-lg">🚀</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Benefits</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 text-sm">⚡</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Gasless Transactions</h4>
                      <p className="text-sm text-gray-600">Execute staking operations without paying gas fees</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 text-sm">🔒</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Enhanced Security</h4>
                      <p className="text-sm text-gray-600">Multi-signature support and advanced access controls</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm">🎯</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Batch Operations</h4>
                      <p className="text-sm text-gray-600">Execute multiple staking operations in a single transaction</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-pink-600 text-sm">🔄</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Automation</h4>
                      <p className="text-sm text-gray-600">Set up automated staking and reward claiming</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How it works Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-100 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">💡</span>
                  </div>
                  <h4 className="font-bold text-blue-800">How it works</h4>
                </div>
                <ol className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                    Connect your MetaMask wallet
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                    Deploy your Smart Account (one-time cost)
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                    Use Smart Account for all staking operations
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">4</span>
                    Enjoy gasless and advanced features!
                  </li>
                </ol>
              </div>

              {/* CTA Card */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Ready to start?</h4>
                <p className="text-purple-100 text-sm mb-4">Deploy your Smart Account and unlock advanced staking features</p>
                <a
                  href="/stake"
                  className="inline-flex items-center justify-center w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm"
                >
                  🚀 Start Staking
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
