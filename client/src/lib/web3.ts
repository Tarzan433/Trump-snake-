import { ethers } from 'ethers';

// Contract addresses (will be set after deployment)
export const CONTRACT_ADDRESSES = {
  MON_TOKEN: import.meta.env.VITE_MON_TOKEN_ADDRESS || '',
  SNAKE_GAME: import.meta.env.VITE_SNAKE_GAME_CONTRACT_ADDRESS || '',
};

// Monad testnet configuration
export const MONAD_TESTNET = {
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

// Contract ABIs
export const MON_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function faucet() external",
  "function mint(address to, uint256 amount) external"
];

export const SNAKE_GAME_ABI = [
  "function submitScore(uint256 score) external",
  "function getHighScore(address player) view returns (uint256)",
  "function hasPlayerReceivedNFT(address player) view returns (bool)",
  "function setReward(uint256 _threshold, uint256 _amount) external",
  "function depositRewards(uint256 amount) external",
  "function rewardThreshold() view returns (uint256)",
  "function rewardAmount() view returns (uint256)",
  "function nftCounter() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "event ScoreSubmitted(address indexed player, uint256 score, bool earnedReward, bool mintedNFT)"
];

export class Web3Manager {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private monTokenContract: ethers.Contract | null = null;
  private snakeGameContract: ethers.Contract | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      
      // Switch to Monad testnet if needed
      await this.switchToMonadTestnet();
      
      // Initialize contracts
      this.initializeContracts();
      
      return address;
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  private async switchToMonadTestnet(): Promise<void> {
    if (!window.ethereum) return;

    try {
      // Try to switch to Monad testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET],
          });
        } catch (addError) {
          throw new Error('Failed to add Monad testnet to MetaMask');
        }
      } else {
        throw new Error('Failed to switch to Monad testnet');
      }
    }
  }

  private initializeContracts(): void {
    if (!this.signer) return;

    if (CONTRACT_ADDRESSES.MON_TOKEN) {
      this.monTokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.MON_TOKEN,
        MON_TOKEN_ABI,
        this.signer
      );
    }

    if (CONTRACT_ADDRESSES.SNAKE_GAME) {
      this.snakeGameContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SNAKE_GAME,
        SNAKE_GAME_ABI,
        this.signer
      );
    }
  }

  async getMonBalance(address: string): Promise<string> {
    try {
      // Use direct RPC call if contract not available
      if (!this.monTokenContract && CONTRACT_ADDRESSES.MON_TOKEN) {
        const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
        const tokenContract = new ethers.Contract(
          CONTRACT_ADDRESSES.MON_TOKEN,
          MON_TOKEN_ABI,
          provider
        );
        const balanceWei = await tokenContract.balanceOf(address);
        return ethers.formatEther(balanceWei);
      }
      
      if (!this.monTokenContract) {
        console.warn('MON token contract not available - contracts need to be deployed');
        return '0';
      }
      
      const balanceWei = await this.monTokenContract.balanceOf(address);
      // Convert from wei to ether units using ethers.formatEther
      const balanceEther = ethers.formatEther(balanceWei);
      return balanceEther;
    } catch (error) {
      console.error('Failed to fetch MON balance:', error);
      return '0';
    }
  }

  async getMonFromFaucet(): Promise<void> {
    if (!this.monTokenContract) {
      throw new Error('MON token contract not deployed. Please deploy the MON token contract and set VITE_MON_TOKEN_ADDRESS.');
    }
    
    const tx = await this.monTokenContract.faucet();
    await tx.wait();
  }

  async approveMonForGame(): Promise<void> {
    if (!this.monTokenContract || !CONTRACT_ADDRESSES.SNAKE_GAME) {
      throw new Error('Contracts not initialized');
    }
    
    const amount = ethers.parseEther('1'); // 1 MON token
    const tx = await this.monTokenContract.approve(CONTRACT_ADDRESSES.SNAKE_GAME, amount);
    await tx.wait();
  }

  async startGame(): Promise<void> {
    // New contract doesn't require entry fee - games are free to play
    // This function exists for compatibility with existing frontend
    if (!this.snakeGameContract) throw new Error('Snake game contract not initialized');
    
    const tx = await this.snakeGameContract.startGame();
    await tx.wait();
  }

  async updateScore(score: number): Promise<void> {
    if (!this.snakeGameContract) throw new Error('Snake game contract not initialized');
    
    // Use submitScore function from new contract
    const tx = await this.snakeGameContract.submitScore(score);
    await tx.wait();
  }

  async submitScore(score: number): Promise<{earnedReward: boolean, mintedNFT: boolean}> {
    if (!this.snakeGameContract) throw new Error('Snake game contract not initialized');
    
    const tx = await this.snakeGameContract.submitScore(score);
    const receipt = await tx.wait();
    
    // Parse event logs to determine if reward was earned and NFT was minted
    let earnedReward = false;
    let mintedNFT = false;
    
    for (const log of receipt.logs) {
      try {
        const parsed = this.snakeGameContract.interface.parseLog(log);
        if (parsed?.name === 'ScoreSubmitted') {
          earnedReward = parsed.args.earnedReward;
          mintedNFT = parsed.args.mintedNFT;
          break;
        }
      } catch (e) {
        // Skip unparseable logs
      }
    }
    
    return { earnedReward, mintedNFT };
  }

  async getLeaderboard(addresses: string[]): Promise<{address: string, score: number}[]> {
    if (!this.snakeGameContract) throw new Error('Snake game contract not initialized');
    
    const leaderboard = [];
    for (const address of addresses) {
      try {
        const score = await this.snakeGameContract.getHighScore(address);
        leaderboard.push({
          address,
          score: Number(score)
        });
      } catch (error) {
        console.error(`Failed to get score for ${address}:`, error);
        leaderboard.push({
          address,
          score: 0
        });
      }
    }
    
    // Sort by score descending
    return leaderboard.sort((a, b) => b.score - a.score);
  }

  async getHighScore(address: string): Promise<number> {
    if (!this.snakeGameContract) throw new Error('Snake game contract not initialized');
    
    const score = await this.snakeGameContract.getHighScore(address);
    return Number(score);
  }

  async hasReceivedNFT(address: string): Promise<boolean> {
    if (!this.snakeGameContract) throw new Error('Snake game contract not initialized');
    
    return await this.snakeGameContract.hasPlayerReceivedNFT(address);
  }

  async getTotalNFTsMinted(): Promise<number> {
    if (!this.snakeGameContract) throw new Error('Snake game contract not initialized');
    
    const total = await this.snakeGameContract.totalNFTsMinted();
    return Number(total);
  }

  isConnected(): boolean {
    return this.signer !== null;
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }
}

// Global instance
export const web3Manager = new Web3Manager();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}