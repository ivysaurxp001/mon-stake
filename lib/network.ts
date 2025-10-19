import { monadTestnet } from './chain';

/**
 * Switch MetaMask to Monad testnet
 */
export async function switchToMonadNetwork(): Promise<void> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Try to switch to Monad testnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${monadTestnet.id.toString(16)}` }],
    });
  } catch (switchError: any) {
    // Chain not added to MetaMask, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${monadTestnet.id.toString(16)}`,
              chainName: monadTestnet.name,
              nativeCurrency: monadTestnet.nativeCurrency,
              rpcUrls: [monadTestnet.rpcUrls.default.http[0]],
              blockExplorerUrls: monadTestnet.blockExplorers
                ? [monadTestnet.blockExplorers.default.url]
                : undefined,
            },
          ],
        });
      } catch (addError) {
        console.error('Failed to add Monad testnet to MetaMask:', addError);
        throw addError;
      }
    } else {
      console.error('Failed to switch to Monad testnet:', switchError);
      throw switchError;
    }
  }
}

