const hre = require("hardhat");

async function main() {
  // Get the deployer account from the local node
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("=========================================");
  console.log("Starting Deployment...");
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log("=========================================");

  // 1. Deploy Authorization Manager
  // We set the 'deployer' as the authorized signer for testing purposes
  const AuthorizationManager = await hre.ethers.getContractFactory("AuthorizationManager");
  const authManager = await AuthorizationManager.deploy(deployer.address);
  await authManager.waitForDeployment();
  const authManagerAddress = await authManager.getAddress();
  
  console.log("SUCCESS: AuthorizationManager deployed to:", authManagerAddress);

  // 2. Deploy Secure Vault
  // The vault must be initialized with the manager's address
  const SecureVault = await hre.ethers.getContractFactory("SecureVault");
  const vault = await SecureVault.deploy(authManagerAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("SUCCESS: SecureVault deployed to:", vaultAddress);

  // 3. Output Network Details for verification
  const network = await hre.ethers.provider.getNetwork();
  console.log("=========================================");
  console.log("DEPLOYMENT SUMMARY");
  console.log("Network Name:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Vault Address:", vaultAddress);
  console.log("Manager Address:", authManagerAddress);
  console.log("Authorized Signer:", deployer.address);
  console.log("=========================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});