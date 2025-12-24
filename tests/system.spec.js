const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecureVault System", function () {
  let admin, recipient, vault, authManager, chainId;

  beforeEach(async function () {
    // FIX: Get signers directly from the provider to avoid the getAddress error
    const signers = await ethers.getSigners();
    admin = signers[0];
    recipient = signers[1];

    const network = await ethers.provider.getNetwork();
    chainId = Number(network.chainId);

    // Deploy AuthorizationManager
    const AuthManager = await ethers.getContractFactory("AuthorizationManager");
    authManager = await AuthManager.deploy(admin.address);
    await authManager.waitForDeployment();

    // Deploy SecureVault
    const Vault = await ethers.getContractFactory("SecureVault");
    vault = await Vault.deploy(await authManager.getAddress());
    await vault.waitForDeployment();

    // Deposit funds into the vault
    await admin.sendTransaction({
      to: await vault.getAddress(),
      value: ethers.parseEther("10.0"),
    });
  });

  async function generateSignature(recipientAddr, amount, nonce) {
    const vaultAddress = await vault.getAddress();
    // Deterministic message construction using ethers v6 AbiCoder
    const abiCoder = new ethers.AbiCoder();
    const encoded = abiCoder.encode(
      ["uint256", "address", "address", "uint256", "bytes32"],
      [chainId, vaultAddress, recipientAddr, amount, nonce]
    );

    const messageHash = ethers.keccak256(encoded);

    // Sign the hash off-chain (signMessage prefixes the message the same way OpenZeppelin expects)
    return await admin.signMessage(ethers.getBytes(messageHash));
  }

  it("Should allow a withdrawal with a valid authorization", async function () {
    const amount = ethers.parseEther("1.0");
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const signature = await generateSignature(recipient.address, amount, nonce);

    const initialBalance = await ethers.provider.getBalance(recipient.address);

    // Execute withdrawal and verify event emission
    await expect(vault.withdraw(recipient.address, amount, nonce, signature))
      .to.emit(vault, "Withdrawn")
      .withArgs(recipient.address, amount);

    const finalBalance = await ethers.provider.getBalance(recipient.address);
    expect(finalBalance).to.be.gt(initialBalance);
  });

  it("Should NOT allow reuse of the same authorization", async function () {
    const amount = ethers.parseEther("1.0");
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const signature = await generateSignature(recipient.address, amount, nonce);

    // First use: Success
    await vault.withdraw(recipient.address, amount, nonce, signature);

    // Second use: Failure
    await expect(
      vault.withdraw(recipient.address, amount, nonce, signature)
    ).to.be.revertedWith("Authorization already used");
  });
});