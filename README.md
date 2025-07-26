# Trump Snake 🐍

A blockchain-powered twist on the classic Snake game, combining nostalgic gameplay with modern Web3 technology. Built on Ethereum-compatible networks with smart contract integration for decentralized gaming experiences.

## Overview

This project merges the timeless appeal of Snake with blockchain technology, creating a decentralized gaming experience where players can interact with smart contracts while enjoying classic arcade gameplay. The game features on-chain score tracking and blockchain-based game mechanics.

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/Tarzan433/Trump-snake🐍.git
cd Trump-snake🐍
```

2. Install root dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client && npm install
```

## Running the Game

Navigate to the client directory and start the development server:

```bash
cd client
npm start
```

The game will be available at `http://localhost:3000`

## Smart Contract Development

### Testing Contracts

Run the test suite to verify smart contract functionality:

```bash
npx hardhat test
```

### Deployment

Deploy smart contracts to Polygon Mumbai testnet:

```bash
npx hardhat run scripts/deploy.js --network mumbai
```

Make sure you have:
- Mumbai testnet MATIC tokens for gas fees
- Proper network configuration in `hardhat.config.js`
- Valid private key in environment variables

## Game Controls

- **↑ Arrow Key**: Move snake up
- **↓ Arrow Key**: Move snake down
- **← Arrow Key**: Move snake left  
- **→ Arrow Key**: Move snake right
- **Space**: Pause/Resume game
- **R**: Restart game

## Technology Stack

- **Frontend**: React.js, Web3.js/Ethers.js
- **Smart Contracts**: Solidity, Hardhat
- **Blockchain**: Ethereum-compatible networks (Polygon)
- **Styling**: CSS3 with responsive design

## Game Features

- Classic Snake gameplay mechanics
- Blockchain integration for score persistence
- Web3 wallet connectivity
- Responsive design for multiple screen sizes
- Real-time score tracking

## Future Features

### Planned Enhancements

- **NFT Rewards**: Earn unique NFTs based on high scores and achievements
- **Power-ups**: Blockchain-based consumable items that enhance gameplay
  - Speed boost tokens
  - Score multiplier items
  - Temporary invincibility shields
- **Leaderboard**: Global ranking system stored on-chain
- **Tournament Mode**: Competitive gameplay with prize pools
- **Custom Skins**: Tradeable NFT snake appearances
- **Multi-chain Support**: Deploy across multiple blockchain networks

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or contributions, please visit the [GitHub repository](https://github.com/Tarzan433/Trump-snake🐍) or open an issue.

---

*Built with ❤️ for the Web3 gaming community*