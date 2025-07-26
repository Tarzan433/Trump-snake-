/**
 * Standalone MetaMask connection function for Monad Testnet
 * This function can be used independently of the Web3Manager class
 */

// Network configuration for Monad Testnet
const MONAD_TESTNET_CONFIG = {
  chainId: '0x279f', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://explorer.testnet.monad.xyz'],
};

/**
 * Connects to MetaMask and adds/switches to Monad Testnet
 * Handles mobile MetaMask browser and desktop extension
 * @returns Promise<string> - The connected wallet address
 */
export async function connectToMonadTestnet(): Promise<string> {
  // Check if MetaMask is installed
  if (!window.ethereum) {
    alert('MetaMask is not installed. Please install MetaMask extension or use MetaMask mobile browser.');
    throw new Error('MetaMask is not installed. Please install MetaMask extension or use MetaMask mobile browser.');
  }

  try {
    console.log('🔗 Starting MetaMask connection...');
    
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      const errorMsg = 'No accounts found. Please connect your MetaMask wallet.';
      alert(errorMsg);
      throw new Error(errorMsg);
    }

    const userAddress = accounts[0];
    console.log('✅ Wallet connected:', userAddress);

    // Check current network
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('🌐 Current Chain ID:', currentChainId, 'Target:', MONAD_TESTNET_CONFIG.chainId);
    
    if (currentChainId === MONAD_TESTNET_CONFIG.chainId) {
      console.log('✅ Already on Monad Testnet');
      return userAddress;
    }

    console.log('🔄 Switching to Monad Testnet...');
    
    // Try to switch to Monad testnet
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
      });
      console.log('✅ Switched to Monad Testnet');
    } catch (switchError: any) {
      console.log('⚠️ Switch failed, trying to add network...', switchError.code);
      
      // If network doesn't exist (error 4902), add it
      if (switchError.code === 4902) {
        console.log('➕ Adding Monad Testnet to MetaMask...');
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET_CONFIG],
          });
          console.log('✅ Monad Testnet added and switched');
        } catch (addError: any) {
          const errorMsg = `Failed to add Monad Testnet to MetaMask: ${addError.message}`;
          alert(errorMsg);
          throw new Error(errorMsg);
        }
      } else if (switchError.code === 4001) {
        const errorMsg = 'User rejected network switch request';
        alert(errorMsg);
        throw new Error(errorMsg);
      } else {
        const errorMsg = `Failed to switch to Monad Testnet: ${switchError.message}`;
        alert(errorMsg);
        throw new Error(errorMsg);
      }
    }

    return userAddress;
  } catch (error: any) {
    console.error('❌ Wallet connection error:', error);
    
    if (error.code === 4001) {
      const errorMsg = 'User rejected the connection request';
      alert(errorMsg);
      throw new Error(errorMsg);
    }
    
    if (error.message) {
      // Don't show alert if we already showed one above
      if (!error.message.includes('MetaMask is not installed') && 
          !error.message.includes('No accounts found') &&
          !error.message.includes('Failed to add') &&
          !error.message.includes('User rejected')) {
        alert(error.message);
      }
      throw error;
    }
    
    const errorMsg = `Failed to connect wallet: ${error.message || 'Unknown error'}`;
    alert(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Checks if the user is currently connected to the Monad testnet
 * @returns Promise<boolean>
 */
export async function isConnectedToMonadTestnet(): Promise<boolean> {
  if (!window.ethereum) return false;

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId === MONAD_TESTNET_CONFIG.chainId;
  } catch {
    return false;
  }
}

/**
 * Gets the current connected wallet address
 * @returns Promise<string | null>
 */
export async function getCurrentWalletAddress(): Promise<string | null> {
  if (!window.ethereum) return null;

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
}

// TypeScript declaration is already defined in the main web3.ts file