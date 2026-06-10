const hre = require("hardhat");

async function main() {
  const OPN_POINTS = "0x45C277439298AAF0952bC92236C78Aa138313a51";

  const MockOPNToken = await hre.ethers.getContractFactory("MockOPNToken");
  const opnToken = await MockOPNToken.deploy();
  await opnToken.waitForDeployment();

  const opnTokenAddress = await opnToken.getAddress();
  console.log("OQH Token deployed to:", opnTokenAddress);

  const OPNStakingVault = await hre.ethers.getContractFactory("OPNStakingVault");
  const vault = await OPNStakingVault.deploy(opnTokenAddress, OPN_POINTS);
  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();
  console.log("OPNStakingVault deployed to:", vaultAddress);

  const rewardAmount = hre.ethers.parseEther("500");

  const claimTx = await opnToken.claimTestOPN();
  await claimTx.wait();

  const fundTx = await opnToken.transfer(vaultAddress, rewardAmount);
  await fundTx.wait();

  console.log("Vault funded with:", hre.ethers.formatEther(rewardAmount), "OQH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});