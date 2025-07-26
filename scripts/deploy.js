import hre from "hardhat";

async function main() {
  console.log("🚀 Starting deployment to Monad testnet...");
  
  // Get the contract factories
  const MockMonToken = await hre.ethers.getContractFactory("MockMonToken");
  const SnakeGame = await hre.ethers.getContractFactory("SnakeGame");

  console.log("\n📋 Deploying MockMonToken...");
  
  // Deploy MockMonToken first
  const monToken = await MockMonToken.deploy();
  await monToken.waitForDeployment();
  const monTokenAddress = await monToken.getAddress();
  
  console.log(`✅ MockMonToken deployed to: ${monTokenAddress}`);

  console.log("\n🎮 Deploying SnakeGame...");
  
  // Deploy SnakeGame with MON token address
  const snakeGame = await SnakeGame.deploy(monTokenAddress);
  await snakeGame.waitForDeployment();
  const snakeGameAddress = await snakeGame.getAddress();
  
  console.log(`✅ SnakeGame deployed to: ${snakeGameAddress}`);

  console.log("\n📄 Deployment Summary:");
  console.log("=".repeat(50));
  console.log(`MockMonToken Address: ${monTokenAddress}`);
  console.log(`SnakeGame Address: ${snakeGameAddress}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${hre.network.config.chainId}`);

  console.log("\n🔧 Add these to your .env file:");
  console.log(`VITE_MON_TOKEN_ADDRESS=${monTokenAddress}`);
  console.log(`VITE_SNAKE_GAME_CONTRACT_ADDRESS=${snakeGameAddress}`);

  // Verify the contracts on the testnet (optional)
  if (hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await monToken.deploymentTransaction().wait(5);
    await snakeGame.deploymentTransaction().wait(5);

    try {
      console.log("\n🔍 Verifying contracts...");
      await hre.run("verify:verify", {
        address: monTokenAddress,
        constructorArguments: [],
      });

      await hre.run("verify:verify", {
        address: snakeGameAddress,
        constructorArguments: [monTokenAddress],
      });
      console.log("✅ Contracts verified successfully");
    } catch (error) {
      console.log("⚠️ Contract verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });