const { ethers } = require("ethers");
const BigNumber = require("bignumber.js");

const BatchContractABI = require("./abi/batchTransaction.json");
const ERC20ABI = require("./abi/mockToken.json");

module.exports = class BatchTransactionSDK {
  /**
   * Initialize the SDK with provider, signer, and batch contract instance.
   * @param {string} rpcUrl - The URL of the blockchain node provider.
   * @param {string} privateKey - The private key of the signer.
   * @param {string} batchContractAddress - The address of the batch contract.
   */
  constructor(rpcUrl, privateKey, batchContractAddress) {
    try {
      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.batchContract = new ethers.Contract(
        batchContractAddress,
        BatchContractABI,
        this.signer
      );
      this.approvalTransactionsList = {};
      this.transactionList = [];
    } catch (error) {
      console.error("Error initializing SDK:", error.message);
      throw error;
    }
  }

  /**
   * Retrieve the provider instance.
   */
  async getProvider() {
    try {
      return this.provider;
    } catch (error) {
      console.error("Error getting provider:", error.message);
      throw error;
    }
  }

  /**
   * Retrieve the signer instance.
   */
  async getSigner() {
    try {
      return this.signer;
    } catch (error) {
      console.error("Error getting signer:", error.message);
      throw error;
    }
  }

  /**
   * Retrieve the batch contract instance.
   */
  async getBatchContract() {
    try {
      return this.batchContract;
    } catch (error) {
      console.error("Error getting batch contract:", error.message);
      throw error;
    }
  }

  /**
   * Retrieve a contract instance for a given address and ABI.
   * @param {string} contractAddress - The address of the contract.
   * @param {Array} abi - The ABI of the contract.
   */
  async getContractInstance(contractAddress, abi) {
    try {
      return new ethers.Contract(contractAddress, abi, this.signer);
    } catch (error) {
      console.error("Error getting contract instance:", error.message);
      throw error;
    }
  }

  /**
   * Retrieve the current transaction list.
   */
  async getTransactionList() {
    try {
      return this.transactionList;
    } catch (error) {
      console.error("Error getting transaction list:", error.message);
      throw error;
    }
  }

  /**
   * Add a transaction to the transaction list if it doesn't already exist.
   * @param {string} target - The target contract address.
   * @param {number} value - The amount of ether to be sent.
   * @param {string} data - The transaction data (encoded function call).
   */
  addTransactionToList(target, value, data) {
    try {
      const transaction = { target, value, data };
      if (
        !this.transactionList.some(
          (tx) => JSON.stringify(tx) === JSON.stringify(transaction)
        )
      ) {
        this.transactionList.push(transaction);
      }
    } catch (error) {
      console.error("Error adding transaction to list:", error.message);
      throw error;
    }
  }

  /**
   * Add an ERC20 transfer transaction to the list.
   * @param {string} tokenAddress - The address of the ERC20 token.
   * @param {string} target - The recipient address.
   * @param {string} value - The amount to be transferred.
   */
  async addERC20Transfer(tokenAddress, target, value) {
    try {
      if (!this.approvalTransactionsList[tokenAddress]) {
        this.approvalTransactionsList[tokenAddress] = new BigNumber(0);
      }

      this.approvalTransactionsList[tokenAddress] =
        this.approvalTransactionsList[tokenAddress].plus(value);

      const tokenContract = await this.getContractInstance(
        tokenAddress,
        ERC20ABI
      );
      const data = tokenContract.interface.encodeFunctionData("transferFrom", [
        await this.signer.getAddress(),
        target,
        value,
      ]);

      this.addTransactionToList(tokenAddress, 0, data);
    } catch (error) {
      console.error("Error adding ERC20 transfer:", error.message);
      throw error;
    }
  }

  /**
   * Add an approval transaction for ERC20 tokens.
   * @param {string} tokenAddress - The address of the ERC20 token.
   * @param {string} target - The contract address to be approved.
   * @param {string} value - The amount to be approved.
   */
  async addERC20Approve(tokenAddress, target, value) {
    try {
      if (!this.approvalTransactionsList[tokenAddress]) {
        this.approvalTransactionsList[tokenAddress] = new BigNumber(0);
      }
      this.approvalTransactionsList[tokenAddress] =
        this.approvalTransactionsList[tokenAddress].plus(value);

      const tokenContract = await this.getContractInstance(
        tokenAddress,
        ERC20ABI
      );
      const approveData = tokenContract.interface.encodeFunctionData(
        "approve",
        [target, value]
      );

      this.addTransactionToList(tokenAddress, 0, approveData);
    } catch (error) {
      console.error("Error adding ERC20 approve:", error.message);
      throw error;
    }
  }

  /**
   * Remove a transaction from the list.
   */
  removeTransactionFromList(target, value, data) {
    try {
      this.transactionList = this.transactionList.filter(
        (tx) =>
          !(tx.target === target && tx.value === value && tx.data === data)
      );
    } catch (error) {
      console.error("Error removing transaction from list:", error.message);
      throw error;
    }
  }

  /**
   * Clear all transactions from the list.
   */
  clearTransactionList() {
    try {
      this.transactionList = [];
    } catch (error) {
      console.error("Error clearing transaction list:", error.message);
      throw error;
    }
  }

  /**
   * Execute all transactions as a batch through the batch contract.
   */
  async executeBatchTransaction() {
    try {
      if (this.transactionList.length === 0) {
        throw new Error("Transaction list is empty");
      }

      const approvePromises = Object.entries(this.approvalTransactionsList).map(
        async ([tokenAddress, requiredApproval]) => {
          try {
            const tokenContract = await this.getContractInstance(
              tokenAddress,
              ERC20ABI
            );
            const allowance = await tokenContract.allowance(
              await this.signer.getAddress(),
              this.batchContract.address
            );

            if (new BigNumber(allowance.toString()).lt(requiredApproval)) {
              return tokenContract.approve(
                this.batchContract.address,
                requiredApproval.toFixed()
              );
            }
          } catch (error) {
            console.error(
              `Error processing approval for token ${tokenAddress}:`,
              error.message
            );
            throw error;
          }
        }
      );

      await Promise.all(approvePromises);

      const targets = this.transactionList.map((tx) => tx.target);
      const values = this.transactionList.map((tx) => tx.value);
      const data = this.transactionList.map((tx) => tx.data);

      const totalValue = values
        .reduce((acc, value) => acc.plus(value.toString()), new BigNumber(0))
        .toFixed();

      const tx = await this.batchContract.executeBatch(targets, data, values, {
        value: totalValue,
      });

      await tx.wait();
      this.clearTransactionList();
      return tx;
    } catch (error) {
      console.error("Error executing batch transaction:", error.message);
      throw error;
    }
  }

  /**
   * Estimate gas for executing all transactions as a batch through the batch contract.
   */
  async estimateGasForBatchTransaction() {
    try {
      if (this.transactionList.length === 0) {
        throw new Error("Transaction list is empty");
      }

      const approvePromises = Object.entries(this.approvalTransactionsList).map(
        async ([tokenAddress, requiredApproval]) => {
          try {
            const tokenContract = await this.getContractInstance(
              tokenAddress,
              ERC20ABI
            );
            const allowance = await tokenContract.allowance(
              await this.signer.getAddress(),
              this.batchContract.address
            );

            if (new BigNumber(allowance.toString()).lt(requiredApproval)) {
              return tokenContract.estimateGas.approve(
                this.batchContract.address,
                requiredApproval.toFixed()
              );
            }
          } catch (error) {
            console.error(
              `Error estimating approval gas for token ${tokenAddress}:`,
              error.message
            );
            throw error;
          }
        }
      );

      await Promise.all(approvePromises);

      const targets = this.transactionList.map((tx) => tx.target);
      const values = this.transactionList.map((tx) => tx.value);
      const data = this.transactionList.map((tx) => tx.data);

      const totalValue = values
        .reduce((acc, value) => acc.plus(value.toString()), new BigNumber(0))
        .toFixed();

      const estimatedGas = await this.batchContract.estimateGas.executeBatch(
        targets,
        data,
        values,
        { value: totalValue }
      );

      return estimatedGas;
    } catch (error) {
      console.error(
        "Error estimating gas for batch transaction:",
        error.message
      );
      throw error;
    }
  }
};
