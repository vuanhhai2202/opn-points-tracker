const hre = require("hardhat");

async function main() {
  const MockOPNToken = await hre.ethers.getContractFactory("MockOPNToken");
  const opnToken = await MockOPNToken.deploy();
  await opnToken.waitForDeployment();

  const opnTokenAddress = await opnToken.getAddress();
  console.log("MockOPNToken deployed to:", opnTokenAddress);

  const OPNStakingVault = await hre.ethers.getContractFactory("OPNStakingVault");
  const vault = await OPNStakingVault.deploy(opnTokenAddress);
  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();
  console.log("OPNStakingVault deployed to:", vaultAddress);

  const rewardAmount = hre.ethers.parseEther("500");
  const tx = await opnToken.claimTestOPN();
  await tx.wait();

  const fundTx = await opnToken.transfer(vaultAddress, rewardAmount);
  await fundTx.wait();

  console.log("Vault funded with:", hre.ethers.formatEther(rewardAmount), "OPN");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});