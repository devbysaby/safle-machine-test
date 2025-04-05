// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BatchTransactionContract {
    // Event emitted after each operation is executed
    event OperationExecuted(address indexed target, bool success, bytes data);

    /**
     * @notice Executes a batch of transactions in a single call.
     * @param targets Array of target contract addresses to interact with.
     * @param data Array of calldata bytes for each transaction.
     * @param amount Array of ETH amounts to be sent with each transaction.
     * @return success Array indicating success/failure of each transaction.
     * @return results Array of returned data from each transaction.
     *
     * The contract will revert all transactions if any single transaction fails.
     * Unused ETH from msg.value is refunded to the sender at the end.
     */
    function executeBatch(
        address[] calldata targets,
        bytes[] calldata data,
        uint256[] calldata amount
    ) external payable returns (bool[] memory success, bytes[] memory results) {
        require(targets.length == data.length, "Mismatched inputs");
        require(targets.length == amount.length, "Mismatched inputs");

        success = new bool[](targets.length);
        results = new bytes[](targets.length);

        // Calculate initial contract balance excluding the msg.value sent with the transaction
        uint256 initialBalance = address(this).balance - msg.value;

        for (uint256 i = 0; i < targets.length; i++) {
            // Perform each call
            (success[i], results[i]) = targets[i].call{value: amount[i]}(
                data[i]
            );

            // If any transaction fails, revert the entire batch
            if (!success[i]) {
                revert(
                    "One of the transactions failed. Reverting all transactions."
                );
            }

            emit OperationExecuted(targets[i], success[i], results[i]);
        }

        // Calculate final balance after executing transactions
        uint256 finalBalance = address(this).balance;

        // If the contract's final balance is less than the initial balance, revert
        if (initialBalance > finalBalance) {
            revert("ETH exceeded: Insufficient funds for transactions");
        }

        uint256 difference = finalBalance - initialBalance;

        // Return any excess ETH to the sender
        if (difference > 0) {
            payable(msg.sender).transfer(difference);
        }
    }

    /**
     * @notice Allows the contract owner to withdraw any remaining funds.
     */
    function withdraw() external {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(msg.sender).transfer(balance);
    }

    /**
     * @notice Fallback function to revert direct payments.
     * Any direct payment to this contract will be rejected.
     */
    fallback() external payable {
        revert("Direct payments not allowed");
    }

    /**
     * @notice Receive function to revert any Ether sent directly.
     */
    receive() external payable {
        revert("Direct payments not allowed");
    }
}
