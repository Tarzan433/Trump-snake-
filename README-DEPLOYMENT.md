# MON Token Balance Fix - Contract Deployment Guide

## Issue
Your Web3 Snake Game is showing "insufficient MON tokens" even when your wallet has MON tokens because the MON token contracts haven't been deployed to Monad testnet yet.

## Solution
Deploy the MON token and Snake Game contracts to fix the balance checking.

## Quick Fix Steps

### 1. Deploy Contracts
```bash
# Set your private key (get from MetaMask -> Account Details -> Export Private Key)
export PRIVATE_KEY=your_private_key_here

# Run deployment script
./deploy-contracts.sh
```

### 2. Set Contract Addresses
After successful deployment, you'll get output like:
```
MockMonToken Address: 0x1234...
SnakeGameContract Address: 0x5678...
```

Set these as environment variables:
```bash
export VITE_MON_TOKEN_ADDRESS=0x1234...
export VITE_SNAKE_GAME_CONTRACT_ADDRESS=0x5678...
```

### 3. Restart Your App
The app will automatically use the deployed contracts and show correct MON balances.

## Manual Deployment (Alternative)

If the script doesn't work, deploy manually:

```bash
# Compile contracts
npx hardhat compile

# Deploy to Monad testnet
npx hardhat run scripts/deploy.js --network monadTestnet
```

## Monad Testnet Details
- **Chain ID**: 10143 (0x279f)
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Explorer**: https://explorer.testnet.monad.xyz
- **Faucet**: Get testnet ETH for gas fees

## Clean JavaScript Balance Checker

Once contracts are deployed, use this clean JavaScript to check MON balance:

```javascript
async function checkMonBalance(walletAddress, tokenAddress) {
  try {
    // Check network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0x279f') {
      throw new Error('Switch to Monad Testnet (Chain ID: 10143)');
    }

    // Create provider and contract
    const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
    const contract = new ethers.Contract(
      tokenAddress,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );

    // Get balance in wei, convert to ether
    const balanceWei = await contract.balanceOf(walletAddress);
    const balanceEther = ethers.formatEther(balanceWei);
    const balance = parseFloat(balanceEther);

    return {
      balance: balanceEther,
      formatted: balance.toFixed(4),
      hasEnough: balance >= 0.01, // Minimum 0.01 MON required
      message: balance >= 0.01 
        ? `Ready to play! Balance: ${balance.toFixed(4)} MON`
        : `Need more MON. Current: ${balance.toFixed(4)}, Required: 0.01`
    };
  } catch (error) {
    return {
      balance: '0',
      formatted: '0.0000',
      hasEnough: false,
      message: `Error: ${error.message}`
    };
  }
}

// Usage
const result = await checkMonBalance(walletAddress, monTokenAddress);
console.log(result.message);
if (result.hasEnough) {
  startGame();
} else {
  showInsufficientBalanceError();
}
```

## Troubleshooting

### Balance Still Shows 0.00
1. Verify contracts are deployed correctly
2. Check environment variables are set
3. Ensure you're on Monad testnet (Chain ID: 10143)
4. Try refreshing wallet connection

### "Insufficient MON tokens" Error
1. Use the faucet to get MON tokens (if contract has faucet function)
2. Check your actual balance using the JavaScript above
3. Verify minimum balance requirement (0.01 MON)

### Deployment Fails
1. Ensure wallet has testnet ETH for gas
2. Check private key format (no 0x prefix needed)
3. Verify network connection
4. Try increasing gas limit in hardhat.config.js