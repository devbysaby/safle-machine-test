# Safle Machine Test - Batch Transaction SDK

This repository contains a **Batch Transaction SDK** that interacts with a smart contract deployed using **Hardhat**. The SDK provides a streamlined interface to handle Ethereum and ERC-20 token transfers in batches, making it easier for developers to bundle multiple transactions into a single operation.

## 📂 Project Structure

```
SAFLE-MACHINE-TEST
├── batch-tx-contract         # Hardhat project for deploying contracts
│   ├── contracts             # Solidity contracts
│   ├── scripts               # Deployment scripts
│   ├── .gitignore            
│   ├── hardhat.config.js     # Hardhat configuration file
│   ├── package-lock.json     
│   ├── package.json          
│   └── README.md             
│
├── sdk                      # SDK Project for interacting with deployed contracts
│   ├── abi                  # ABI files for deployed contracts
│   ├── test                 # Test cases for the SDK
│   ├── .env.sample          # Environment variables sample
│   ├── .gitignore           
│   ├── index.js             # SDK Implementation
│   ├── package-lock.json    
│   └── package.json         
```

## 🚀 Deploying the Contract

Go to [Deployment Instructions](./batch-tx-contract/README.md) in `batch-tx-contract` folder to deploy contracts.


## 📦 Installation

### Installation

Install the SDK using npm:
```bash
npm install <path-to-sdk-folder>
```

### Importing the SDK
```javascript
const BatchTransactionSDK = require('BatchTransactionSDK');
```

### Initializing the SDK
To start using the SDK, you need to provide:

- **`rpcUrl`**: URL of the blockchain node provider (e.g., Infura, Alchemy).
- **`privateKey`**: Private key of the signer (Make sure to keep this safe!).
- **`batchContractAddress`**: The deployed address of your batch contract.

```javascript
const sdk = new BatchTransactionSDK(<RPC_URL>, <PRIVATE_KEY>, <BATCH_CONTRACT_ADDRESS>);
```

### Get Provider

```javascript
const provider = await sdk.getProvider();
```

Returns the provider instance connected to the specified RPC URL.

---

### Get Signer

```javascript
const signer = await sdk.getSigner();
```

Returns the signer instance initialized with your private key.

---

### Get Batch Contract

```javascript
const batchContract = await sdk.getBatchContract();
```

Returns the batch contract instance connected with the signer.

---

## Adding Transactions

The SDK supports various transaction types, including ETH transfers, ERC20 transfers, ERC20 approvals, and smart contract interactions.

### Add ETH Transfer

Add a simple ETH transfer to the transaction list.

```javascript
sdk.addTransactionToList(
  targetAddress,                  // The recipient's Ethereum address
  ethers.utils.parseEther('0.1'),  // The amount of ETH to send (in wei)
  '0x'                            // Optional data payload (empty by default)
);
```

---

### Add ERC20 Transfer

The SDK supports transferring ERC20 tokens by using `addERC20Transfer()`. This method will automatically prepare a transaction for `transferFrom()`.

```javascript
await sdk.addERC20Transfer(
  tokenAddress,       // The contract address of the ERC20 token
  recipientAddress,    // The recipient's Ethereum address
  value               // The amount of tokens to transfer (in token decimals)
);
```

**Note:** Approval handling is managed internally by the SDK before the actual transfer transaction is added to the batch.

---

### Add ERC20 Approve Transaction

If you need to approve tokens separately for a specific target contract, use the following method. This is useful when preparing transactions that require `approve()` calls before a transfer.

```javascript
await sdk.addERC20Approve(
  tokenAddress,    // The address of the ERC20 token
  targetAddress,   // The address to approve for spending tokens
  value            // The amount to approve (in token decimals)
);
```

**Process:**

1. The approval transaction is added to the transaction list.
2. During batch execution, the contract will transfer tokens to itself and then approve the target address.

---

### Add Contract Interaction

You can interact with any smart contract by specifying the contract address, the value to send (if any), and the encoded function call data.

```javascript
sdk.addTransactionToList(
  contractAddress,               // The address of the contract to interact with
  ethers.utils.parseEther('0.1'), // Amount of ETH to send (if applicable)
  hexData                        // Encoded function call data
);
```

---

## Managing Transactions

You can manage the transaction list with the following functions.

### Retrieve Transaction List

```javascript
const transactionList = await sdk.getTransactionList();
```

---

### Remove Transaction

```javascript
sdk.removeTransactionFromList(target, value, data);
```

---

### Clear Transaction List

```javascript
sdk.clearTransactionList();
```

This clears all the transactions currently held in memory.

---

### **Estimate Gas Usage**

The function estimates the gas required to execute the current batch transaction. This includes the additional Approval transactions too.

```javascript
sdk.estimateGasForBatchTransaction();
```

---

## Executing Batch Transaction

Once all desired transactions are added to the list, you can execute them in a single batch transaction. This operation sends all included transactions as a single transaction to the network, potentially reducing gas costs and improving efficiency.

```javascript
const tx = await sdk.executeBatchTransaction();
console.log("Batch transaction executed:", tx.hash);
```

### Execution Process

1. **Approval Handling**:  
   The SDK automatically checks for required ERC-20 approvals and sends approval transactions if necessary.

2. **Batch Execution**:  
   All transactions are submitted to the underlying batch contract in one go.

3. **Receipt Handling**:  
   The transaction receipt is returned once the transaction is mined successfully.


## Example Usage

```javascript
const sdk = new BatchTransactionSDK(
  "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
  "YOUR_PRIVATE_KEY",
  "0xBatchContractAddress"
);

(async () => {
  await sdk.addERC20Approve("0xTokenAddress", "0xRecipientAddress", "1000000000000000000");
  await sdk.addERC20Transfer("0xTokenAddress", "0xRecipientAddress", "1000000000000000000");
  await sdk.addTransactionToList("0xRecipientAddress", ethers.utils.parseEther("0.05"), '0x');

  const tx = await sdk.executeBatchTransaction();
  console.log("Batch transaction executed successfully:", tx.hash);
})();
```

## 📑 Configuration (For Testing Only)

Make a copy of `.env.sample` file inside the `sdk` directory, rename it to `.env` and assign appropriate values:

```
ALCHEMY_API_URL=<Your RPC URL>
PRIVATE_KEY=<Your Wallet Private Key>
BATCH_CONTRACT_ADDRESS=<Deployed Batch Contract Address>
MOCK_TOKEN_ADDRESS=<Deployed Mock Token Address>
SIMPLE_STORAGE_ADDRESS=<Deployed Simple Storage Address>
```


## ✅ Testing

Inside the `sdk` directory, create your test cases in the `test` folder and run:

```bash
npm test
```

## 📌 Notes

- Make sure to deploy the contracts before using the SDK.
- The `sdk` folder is separate from the `batch-tx-contract` folder.
- Always provide the correct `BATCH_CONTRACT_ADDRESS` in the `.env` file.