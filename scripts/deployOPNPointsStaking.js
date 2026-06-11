const hre = require("hardhat");

async function main() {
  const OPN_TOKEN_ADDRESS = "0x2aEc1Db9197Ff284011A6A1d0752AD03F5782B0d";

  const OPNPointsStaking = await hre.ethers.getContractFactory(
    "OPNPointsStaking"
  );

  const staking = await OPNPointsStaking.deploy(OPN_TOKEN_ADDRESS);

  await staking.waitForDeployment();

  console.log("OPNPointsStaking deployed to:", await staking.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});