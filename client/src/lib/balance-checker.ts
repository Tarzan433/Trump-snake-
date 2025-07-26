import { ethers } from 'ethers';

// Monad Testnet configuration
const MONAD_TESTNET_CONFIG = {
  chainId: '0x279f', // 10143 in hex
  rpcUrl: 'https://testnet-rpc.monad.xyz',
};

// ERC20 ABI for balance checking
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function faucet() external"
];

/**
 * Clean JavaScript function to check MON token balance on Monad Testnet
 * Uses ethers.js to connect directly to the blockchain
 */
export async function checkMonBalance(walletAddress: string, tokenAddress?: string): Promise<{
  balance: string;
  balanceFormatted: string;
  hasEnoughForGame: boolean;
  error?: string;
}> {
  try {
    // Check if we're on the correct network
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== MONAD_TESTNET_CONFIG.chainId) {
        return {
          balance: '0',
          balanceFormatted: '0.0000',
          hasEnoughForGame: false,
          error: 'Please switch to Monad Testnet (Chain ID: 10143)'
        };
      }
    }

    // If no token address provided, we can't check balance
    if (!tokenAddress) {
      return {
        balance: '0',
        balanceFormatted: '0.0000',
        hasEnoughForGame: false,
        error: 'MON token contract not deployed yet'
      };
    }

    // Create provider and contract instance
    const provider = new ethers.JsonRpcProvider(MONAD_TESTNET_CONFIG.rpcUrl);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    // Get balance in wei
    const balanceWei = await tokenContract.balanceOf(walletAddress);
    
    // Convert to ether units using ethers.formatEther
    const balanceEther = ethers.formatEther(balanceWei);
    const balanceNum = parseFloat(balanceEther);

    return {
      balance: balanceEther,
      balanceFormatted: balanceNum.toFixed(4),
      hasEnoughForGame: balanceNum >= 0.01, // Minimum 0.01 MON required
      error: undefined
    };

  } catch (error: any) {
    console.error('Failed to check MON balance:', error);
    return {
      balance: '0',
      balanceFormatted: '0.0000',
      hasEnoughForGame: false,
      error: `Failed to fetch balance: ${error.message}`
    };
  }
}

/**
 * Enhanced balance check that also validates the network and provides detailed feedback
 */
export async function validateGameRequirements(walletAddress: string, tokenAddress?: string): Promise<{
  canPlay: boolean;
  message: string;
  balance: string;
  suggestions: string[];
}> {
  const result = await checkMonBalance(walletAddress, tokenAddress);
  
  if (result.error) {
    return {
      canPlay: false,
      message: result.error,
      balance: result.balanceFormatted,
      suggestions: [
        'Make sure you\'re connected to Monad Testnet',
        'Check if contracts are deployed',
        'Try refreshing your wallet connection'
      ]
    };
  }

  if (!result.hasEnoughForGame) {
    return {
      canPlay: false,
      message: `Insufficient MON tokens. Current: ${result.balanceFormatted} MON, Required: 0.01 MON`,
      balance: result.balanceFormatted,
      suggestions: [
        'Use the faucet to get 100 MON tokens',
        'Check if you\'re using the correct wallet',
        'Verify you\'re on Monad Testnet'
      ]
    };
  }

  return {
    canPlay: true,
    message: `Ready to play! Balance: ${result.balanceFormatted} MON`,
    balance: result.balanceFormatted,
    suggestions: []
  };
}

/**
 * Direct faucet call function
 */
export async function callMonFaucet(tokenAddress: string): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    const tx = await tokenContract.faucet();
    await tx.wait();

    return {
      success: true,
      txHash: tx.hash
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}