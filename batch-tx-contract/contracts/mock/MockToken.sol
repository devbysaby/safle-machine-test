// erc20 token named MockToken
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    address public owner;

    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    /**
     * @notice Constructor initializes the ERC20 token with name and symbol.
     * Sets the contract deployer as the owner.
     */
    constructor() ERC20("MockToken", "MTK") {
        owner = msg.sender;
    }

    /**
     * @notice Allows the owner to mint new tokens.
     * @param to The address that will receive the minted tokens.
     * @param amount The number of tokens to be minted.
     * Emits a Mint event upon successful minting.
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "Only owner can mint"); // Only the owner can mint new tokens
        _mint(to, amount); // Minting the specified amount of tokens
        emit Mint(to, amount); // Emitting the mint event
    }

    /**
     * @notice Allows any user to burn their own tokens.
     * @param amount The number of tokens to be burned.
     * Emits a Burn event upon successful burning.
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount); // Burning the specified amount of tokens from the sender's balance
        emit Burn(msg.sender, amount); // Emitting the burn event
    }
}
