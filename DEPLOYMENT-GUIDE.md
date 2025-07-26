# Complete Monad Testnet Deployment Guide

## Quick Start Summary

Your Web3 Snake Game is ready! Here's what's been built:

✅ **Complete Web3 Integration** - MetaMask connection for Monad Testnet  
✅ **Smart Contracts** - MockMonToken + SnakeGame contracts compiled and ready  
✅ **Free-to-Play Model** - No upfront cost, earn rewards for good scores  
✅ **NFT Rewards** - Every game mints an NFT to your wallet  
✅ **MON Token Rewards** - Score 50+ to earn 1 MON token  

## Final Step: Deploy Contracts

To complete the setup and fix the "insufficient MON tokens" message:

### 1. Get Your Private Key
- Open MetaMask > Account Details > Export Private Key
- Copy the private key (starts with 0x...)

### 2. Set Environment Variable
```bash
export PRIVATE_KEY=your_private_key_here
```

### 3. Deploy to Monad Testnet
```bash
npx hardhat run scripts/deploy.js --network monadTestnet
```

### 4. Update Environment
Add the deployed contract addresses to your `.env` file:
```bash
VITE_MON_TOKEN_ADDRESS=0x...
VITE_SNAKE_GAME_CONTRACT_ADDRESS=0x...
```

## What This Fixes

- ✅ Removes "insufficient MON tokens" error
- ✅ Enables real MON token balance checking  
- ✅ Activates faucet functionality
- ✅ Enables blockchain score submission
- ✅ Activates NFT minting for every game

## Current Game Features

### Web3 Integration
- **MetaMask Connection**: Automatic Monad Testnet setup
- **Wallet Management**: Balance checking and transaction handling
- **Network Switching**: Auto-switch to Monad Testnet (Chain ID 10143)

### Game Modes
- **Classic Mode**: Traditional snake with walls
- **Portal Mode**: Wrap-around edges with 2x score bonus  
- **Speed Boost Mode**: Ultra-fast gameplay with 1.5x score bonus

### Blockchain Features
- **Free Entry**: No upfront payment required
- **Score Rewards**: Earn 1 MON token for scores 50+
- **NFT Minting**: Get an NFT for every game played
- **On-Chain Leaderboard**: High scores stored on blockchain

### Smart Contracts
- **MockMonToken**: ERC20 token with faucet function
- **SnakeGame**: ERC721 NFT contract with reward system

The game is fully functional and ready for blockchain integration once contracts are deployed!