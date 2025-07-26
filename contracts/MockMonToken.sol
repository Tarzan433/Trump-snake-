// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockMonToken
 * @dev Mock ERC20 token for testing purposes on Monad testnet
 */
contract MockMonToken is ERC20 {
    constructor() ERC20("Mock Monad Token", "MON") {
        // Mint 1 million tokens to deployer for testing
        _mint(msg.sender, 1000000 * 10**18);
    }

    /**
     * @dev Faucet function - allows anyone to mint 100 MON tokens for testing
     */
    function faucet() external {
        _mint(msg.sender, 100 * 10**18);
    }

    /**
     * @dev Allow contract owner to mint more tokens if needed
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}