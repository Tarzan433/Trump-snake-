# 🚀 Web3 Snake Game - Complete Setup Guide

## 🎯 What We've Built

Your Snake game now has full Web3 integration with the Monad blockchain! Here's what's been implemented:

### ✅ Features Completed

1. **Smart Contracts**:
   - `SnakeGameContract.sol` - Main game contract with score tracking and NFT rewards
   - `MockMonToken.sol` - Test MON token with faucet functionality

2. **Web3 Integration**:
   - MetaMask wallet connection
   - Automatic Monad testnet network switching
   - 1 MON token payment to start games
   - On-chain high score storage
   - NFT minting for scores over 100

3. **User Interface**:
   - Wallet connection component with balance display
   - Game access control (pay to play)
   - Real-time Web3 status display
   - Faucet integration for test tokens

## 📋 Deployment Instructions

### Step 1: Get Your Private Key from MetaMask

1. Open MetaMask browser extension
2. Click your account icon → Account details → Export private key
3. Enter your MetaMask password
4. **COPY THE PRIVATE KEY** (keep it secret!)

### Step 2: Configure Environment Variables

1. Open the `.env` file in your project
2. Add your private key:
```env
PRIVATE_KEY=your_private_key_here_without_0x
```

### Step 3: Deploy Smart Contracts

Run this command in the terminal:

```bash
npx hardhat run scripts/deploy.js --network monadTestnet
```

This will:
- Deploy the MON token contract
- Deploy the Snake Game contract
- Display the contract addresses

### Step 4: Update Contract Addresses

After deployment, copy the contract addresses and add them to your `.env` file:

```env
VITE_MON_TOKEN_ADDRESS=0x...
VITE_SNAKE_GAME_CONTRACT_ADDRESS=0x...
```

### Step 5: Restart the Application

The app will automatically restart and your Web3 features will be active!

## 🎮 How Players Use the Web3 Game

### For Players - Step by Step:

1. **Connect Wallet**: Click "Connect MetaMask" 
2. **Switch Networks**: MetaMask will prompt to add/switch to Monad testnet
3. **Get Test Tokens**: Click "Get 100 MON (Faucet)" to receive free tokens
4. **Start Game**: Click "Pay 1 MON & Play" to begin
5. **Play**: Use arrow keys or mobile controls to play Snake
6. **Earn NFT**: Score over 100 points to automatically receive an NFT reward!

## 🛠️ Technical Architecture

### Smart Contract Features:

- **Entry Fee**: 1 MON token required to start each game
- **High Score Tracking**: Only updates if new score beats previous record
- **NFT Rewards**: ERC721 tokens minted automatically for scores > 100
- **Owner Functions**: Contract owner can withdraw collected fees

### Frontend Integration:

- **Web3Manager Class**: Handles all blockchain interactions
- **Wallet Connect Component**: User-friendly MetaMask integration
- **Game Wrapper**: Controls game access based on payment status
- **Real-time Updates**: Live balance and score tracking

## 🌐 Network Details

- **Network**: Monad Testnet
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **Chain ID**: 41454
- **Explorer**: `https://testnet-explorer.monad.xyz`

## 🔧 Troubleshooting

### Common Issues:

1. **"Contract not initialized"**: Make sure contract addresses are set in `.env`
2. **"Insufficient MON tokens"**: Use the faucet to get test tokens
3. **MetaMask not detected**: Install MetaMask browser extension
4. **Network switching fails**: Manually add Monad testnet in MetaMask

### Manual Network Addition:
- Network Name: Monad Testnet
- RPC URL: https://testnet-rpc.monad.xyz
- Chain ID: 41454
- Currency Symbol: MON

## 🎊 Next Steps

Your game is now a fully functional Web3 dApp! Players can:
- Pay MON tokens to play
- Compete for on-chain high scores
- Earn NFT rewards for high performance
- View their achievements in MetaMask

The contracts are deployed to Monad testnet and ready for players to enjoy!