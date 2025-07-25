import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 2141,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 2100000,
      gasPrice: 8000000000,
    },
  },
  etherscan: {
    apiKey: {
      monadTestnet: "your-etherscan-api-key",
    },
    customChains: [
      {
        network: "monadTestnet",
        chainId: 2141,
        urls: {
          apiURL: "https://explorer.testnet.monad.xyz/api",
          browserURL: "https://explorer.testnet.monad.xyz",
        },
      },
    ],
  },
};