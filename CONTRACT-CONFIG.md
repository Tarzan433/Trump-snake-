# Contract Configuration for Monad Testnet

## Network Configuration
- **Chain ID**: 10143 (0x279f)
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Explorer**: https://explorer.testnet.monad.xyz

## Deployed Contract Addresses

### MON Token Contract
```
Address: 0xYourMONTokenAddress
Type: ERC20 Mock Token with Faucet
Features:
- Standard ERC20 functionality
- Public faucet for testing
- Used for game rewards
```

### Snake Game Contract
```
Address: 0xYourGameContractAddress
Type: ERC721 NFT + Game Logic
Features:
- Score submission and leaderboard
- NFT minting for every game
- MON token rewards for scores >= 50
- Event emission for reward tracking
```

## Environment Variables Setup

Add these to your `.env` file:
```bash
VITE_MON_TOKEN_ADDRESS=0xYourMONTokenAddress
VITE_SNAKE_GAME_CONTRACT_ADDRESS=0xYourGameContractAddress
```

## Contract Functions Used

### MON Token Contract
- `balanceOf(address)` - Check wallet balance
- `faucet()` - Get test tokens
- `transfer(address, uint256)` - Send rewards

### Snake Game Contract
- `submitScore(uint256)` - Submit game score
- `getHighScore(address)` - Get player's high score
- `hasPlayerReceivedNFT(address)` - Check NFT status
- Event: `ScoreSubmitted(address, uint256, bool, bool)` - Track rewards

## Ready for Testing

With these contract addresses, the Web3 Snake Game is now fully functional:

1. **MetaMask Connection** - Auto-connects to Monad Testnet Chain ID 10143
2. **Token Balance** - Real MON token balance checking
3. **Game Rewards** - Actual MON token transfers for scores >= 50
4. **NFT Minting** - Real NFT creation for every game
5. **Blockchain Leaderboard** - Live data from smart contract
6. **Faucet** - Get test MON tokens for gameplay

The application will now interact with real deployed contracts instead of showing placeholder messages.