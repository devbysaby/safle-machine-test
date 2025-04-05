// scripts/deploy.js

const { ethers } = require("hardhat");

async function deployBatchTransactionContract() {
    const BatchTransactionContract = await ethers.getContractFactory("BatchTransactionContract");
    const batchTransactionContract = await BatchTransactionContract.deploy();
    await batchTransactionContract.waitForDeployment();
    console.log(`BatchTransactionContract deployed to: ${batchTransactionContract.target}`);
}

async function deployMockContracts(){
    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy();
    await mockToken.waitForDeployment();
    console.log(`MockToken deployed to: ${mockToken.target}`);

    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.waitForDeployment();
    console.log(`SimpleStorage deployed to: ${simpleStorage.target}`);
}

async function main() {
   await deployBatchTransactionContract();
   await deployMockContracts();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
