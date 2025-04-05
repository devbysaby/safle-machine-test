const { expect } = require("chai");
const { ethers } = require("ethers");
const BatchTransactionSDK = require("../index.js");
const { describe, it, before } = require("mocha");
const BigNumber = require("bignumber.js");
const dotenv = require("dotenv");
dotenv.config();

const mockTokenABI = require("../abi/mockToken.json");
const simpleStorageABI = require("../abi/simpleStorage.json");

let sdk, mockToken, simpleStorage;
const transferAmount = ethers.utils.parseEther("10").toString();

before(async () => {
  // Initializing SDK with environment variables
  sdk = new BatchTransactionSDK(
    process.env.ALCHEMY_API_URL,
    process.env.PRIVATE_KEY,
    process.env.BATCH_CONTRACT_ADDRESS
  );

  // Load contract instances using their addresses from the .env file
  mockToken = await sdk.getContractInstance(
    process.env.MOCK_TOKEN_ADDRESS,
    mockTokenABI
  );
  simpleStorage = await sdk.getContractInstance(
    process.env.SIMPLE_STORAGE_ADDRESS,
    simpleStorageABI
  );

  // Mint some tokens for testing
  const signer = await sdk.getSigner();
  await mockToken.mint(signer.address, ethers.utils.parseEther("1000"));
});

describe("BatchTransactionSDK Test Suite", () => {
  it("Should send ETH as a batch transfer", async function () {
    const recipients = [
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
    ];

    const provider = await sdk.getProvider();
    const initialBalances = await Promise.all(
      recipients.map((recipient) => provider.getBalance(recipient))
    );

    // Adding transactions to the batch list
    recipients.forEach((recipient) => {
      sdk.addTransactionToList(
        recipient,
        ethers.utils.parseEther("0.01"),
        "0x"
      );
    });

    await sdk.executeBatchTransaction();

    // Verify updated balances
    await Promise.all(
      recipients.map(async (recipient, index) => {
        const finalBalance = await provider.getBalance(recipient);
        const expectedBalance = new BigNumber(initialBalances[index].toString())
          .plus(new BigNumber(ethers.utils.parseEther("0.01").toString()))
          .toFixed();

        expect(finalBalance.toString()).to.equal(expectedBalance.toString());
      })
    );
  });

  it("Should send ERC20 tokens as a batch transfer", async function () {
    const recipients = [
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
    ];

    const initialBalances = await Promise.all(
      recipients.map((recipient) => mockToken.balanceOf(recipient))
    );

    // Adding ERC20 transfers to the batch list
    for (let recipient of recipients) {
      await sdk.addERC20Transfer(mockToken.address, recipient, transferAmount);
    }

    await sdk.executeBatchTransaction();

    // Verify updated balances
    await Promise.all(
      recipients.map(async (recipient, index) => {
        const finalBalance = await mockToken.balanceOf(recipient);
        const expectedBalance = new BigNumber(initialBalances[index].toString())
          .plus(transferAmount)
          .toFixed();

        expect(finalBalance.toString()).to.equal(expectedBalance.toString());
      })
    );
  });

  it("Should call set function in SimpleStorage contract multiple times", async function () {
    const valuesToSet = [42, 84, 126];
    const encodedCalls = valuesToSet.map((value) =>
      simpleStorage.interface.encodeFunctionData("set", [value])
    );

    // Add each transaction to the batch list
    encodedCalls.forEach((encodedCall) => {
      sdk.addTransactionToList(
        process.env.SIMPLE_STORAGE_ADDRESS,
        ethers.utils.parseEther("0.001").toString(),
        encodedCall
      );
    });

    // Execute the batch transaction
    const tx = await sdk.executeBatchTransaction();
    await tx.wait();

    // Verify the last value set
    const latestValue = await simpleStorage.get();
    expect(latestValue.toString()).to.equal("126");
  });
});
