const { ethers } = require("hardhat");

// Deploys the BatchTransactionContract.
async function deployBatchTransactionContract() {
    try {
        const BatchTransactionContract = await ethers.getContractFactory("BatchTransactionContract");
        const batchTransactionContract = await BatchTransactionContract.deploy();
        await batchTransactionContract.waitForDeployment();
        console.log(`✅ BatchTransactionContract deployed to: ${batchTransactionContract.target}`);
    } catch (error) {
        console.error("❌ Error deploying BatchTransactionContract:", error);
    }
}

// Deploys MockToken and SimpleStorage contracts concurrently for optimization.
async function deployMockContracts() {
    try {
        const [MockToken, SimpleStorage] = await Promise.all([
            ethers.getContractFactory("MockToken"),
            ethers.getContractFactory("SimpleStorage")
        ]);

        const [mockToken, simpleStorage] = await Promise.all([
            MockToken.deploy(),
            SimpleStorage.deploy()
        ]);

        await Promise.all([mockToken.waitForDeployment(), simpleStorage.waitForDeployment()]);

        console.log(`✅ MockToken deployed to: ${mockToken.target}`);
        console.log(`✅ SimpleStorage deployed to: ${simpleStorage.target}`);
    } catch (error) {
        console.error("❌ Error deploying Mock Contracts:", error);
    }
}

// Deploy all contracts and handle errors.
async function main() {
    console.log("🚀 Starting deployment...");

    await deployBatchTransactionContract();
    await deployMockContracts();

    console.log("🎉 Deployment completed successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Uncaught Error in Deployment:", error);
    process.exit(1);
  });

