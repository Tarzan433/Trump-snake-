// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SnakeGame is ERC721URIStorage, Ownable {
    IERC20 public monToken;
    uint256 public nftCounter;
    uint256 public rewardThreshold = 50; // score needed for rewards
    uint256 public rewardAmount = 1 ether; // 1 MON token

    mapping(address => uint256) public highScores;

    event ScoreSubmitted(address indexed player, uint256 score, bool earnedReward, bool mintedNFT);

    constructor(address _monToken) ERC721("SnakeNFT", "SNK") Ownable(msg.sender) {
        monToken = IERC20(_monToken);
    }

    function submitScore(uint256 score) external {
        // update leaderboard
        if (score > highScores[msg.sender]) {
            highScores[msg.sender] = score;
        }

        bool earnedReward = false;
        // send reward if score passes threshold
        if (score >= rewardThreshold) {
            require(monToken.balanceOf(address(this)) >= rewardAmount, "Not enough reward tokens");
            monToken.transfer(msg.sender, rewardAmount);
            earnedReward = true;
        }

        // mint NFT for each valid play
        nftCounter++;
        _mint(msg.sender, nftCounter);
        _setTokenURI(nftCounter, "ipfs://your-snakenft-metadata-uri"); // replace with real IPFS link

        emit ScoreSubmitted(msg.sender, score, earnedReward, true);
    }

    function getHighScore(address player) public view returns (uint256) {
        return highScores[player];
    }

    function setReward(uint256 _threshold, uint256 _amount) external onlyOwner {
        rewardThreshold = _threshold;
        rewardAmount = _amount;
    }

    function depositRewards(uint256 amount) external {
        monToken.transferFrom(msg.sender, address(this), amount);
    }

    // Legacy compatibility functions for existing Web3Manager
    function hasPlayerReceivedNFT(address player) external view returns (bool) {
        return balanceOf(player) > 0; // True if player has any NFTs
    }

    function startGame() external {
        // No entry fee required in new contract - games are free to play
        // This function exists for compatibility with existing frontend
    }

    function updateScore(uint256 score) external {
        // Alias for submitScore to maintain compatibility
        // Update leaderboard
        if (score > highScores[msg.sender]) {
            highScores[msg.sender] = score;
        }

        // Send reward if score passes threshold
        if (score >= rewardThreshold) {
            require(monToken.balanceOf(address(this)) >= rewardAmount, "Not enough reward tokens");
            monToken.transfer(msg.sender, rewardAmount);
        }

        // Mint NFT for each valid play
        nftCounter++;
        _mint(msg.sender, nftCounter);
        _setTokenURI(nftCounter, "ipfs://your-snakenft-metadata-uri");
    }
}