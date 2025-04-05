# Batch Transaction Contract - Hardhat Project

## 📌 Overview
This Hardhat project implements a **Batch Transaction Contract** for batch-processing ETH transfers, ERC20 transfers, and contract interactions The project includes:
- A **Batch Transaction Contract** for batch-processing ETH transfers, ERC20 transfers, and contract interactions.
- A **SimpleStorage Contract** with payable functions.
- An **ERC20 MockToken Contract** for testing.
- Complete test cases to validate the contract functionality.

## 📁 Project Structure
```
├── contracts
│   ├── BatchTransactionContract.sol
│   └── mock
│       ├── SimpleStorage.sol
│       └── MockToken.sol
├── scripts
│   ├── deploy.js
├── hardhat.config.js
├── package.json
├── README.md
```

## 🚀 Getting Started
### 1. Install Dependencies
```
npm install
```

### 2. Compile Contracts
```
npx hardhat compile
```

### 3. Deploy Contracts
```
npx hardhat run scripts/deploy.js --network <network>
```


## 🔑 Contracts Description
### 1. **BatchTransactionContract.sol**
- Handles batch transactions for ETH, ERC20, and contract calls.
- Includes error handling and balance checks.
- Provides `withdraw()` function to collect remaining funds.

### 2. **SimpleStorage.sol**
- Stores a single `uint256` value.
- Requires a fee of `0.001 ETH` for the `set()` function.
- Provides a `withdraw()` function for the owner.

### 3. **MockToken.sol**
- An ERC20 token with minting and burning functionalities.
- Uses OpenZeppelin's ERC20 standard implementation.
- Emits `Mint` and `Burn` events.

## 📌 Configuration
Update your `.env` file with the following variables:
```
RPC_URL=<your alchemy api url>
PRIVATE_KEY=<your wallet private key>
```

## 📦 Dependencies
- `ethers`
- `hardhat`
- `dotenv`
- `@openzeppelin/contracts`



