#!/bin/bash

echo "🚀 Deploying MON Token and Snake Game contracts to Monad Testnet"
echo "=================================================="

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY environment variable not set"
    echo ""
    echo "To deploy contracts, you need to:"
    echo "1. Export your private key: export PRIVATE_KEY=your_private_key_here"
    echo "2. Make sure your wallet has testnet ETH for gas fees"
    echo "3. Run this script again"
    echo ""
    echo "Get testnet ETH from: https://faucet.monad.testnet"
    exit 1
fi

echo "✅ Private key found, starting deployment..."

# Compile contracts
echo "📋 Compiling contracts..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Contract compilation failed"
    exit 1
fi

echo "✅ Contracts compiled successfully"

# Deploy to Monad testnet
echo "🚀 Deploying to Monad testnet..."
npx hardhat run scripts/deploy.js --network monadTestnet

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Copy the contract addresses from the output above"
    echo "2. Set them as environment variables:"
    echo "   export VITE_MON_TOKEN_ADDRESS=<MON_TOKEN_ADDRESS>"
    echo "   export VITE_SNAKE_GAME_CONTRACT_ADDRESS=<SNAKE_GAME_ADDRESS>"
    echo "3. Restart your application to use the deployed contracts"
else
    echo "❌ Deployment failed"
    echo "Make sure:"
    echo "- Your private key is correct"
    echo "- Your wallet has enough testnet ETH for gas"
    echo "- You're connected to the internet"
    exit 1
fi