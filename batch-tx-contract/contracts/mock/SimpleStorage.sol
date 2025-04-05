// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SimpleStorage {
    uint256 private storedData;
    address private owner;
    uint256 public constant fee = 0.001 ether;

    event DataStored(uint256 data);

    /**
     * @notice Constructor to set the contract deployer as the owner.
     * Only the owner can withdraw the funds collected from fees.
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Sets the stored data to a new value.
     * @dev Requires a fee of 0.001 ETH to successfully execute.
     * @param x The new value to be stored.
     * Emits a DataStored event upon success.
     */
    function set(uint256 x) public payable {
        require(msg.value == fee, "Insufficient fee provided"); // Ensures the user pays the required fee
        storedData = x; // Sets the new stored data value
        emit DataStored(x); // Emits the event indicating the value has been stored
    }

    /**
     * @notice Retrieves the currently stored data.
     * @return The stored data value.
     */
    function get() public view returns (uint256) {
        return storedData;
    }

    /**
     * @notice Allows the owner to withdraw all accumulated fees.
     * Reverts if there are no funds to withdraw.
     */
    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner).transfer(balance);
    }
}
