const hre = require("hardhat");

async function main() {
  const NativeStaking = await hre.ethers.getContractFactory(
    "OPNNativePointsStaking"
  );

  const staking = await NativeStaking.deploy();

  await staking.waitForDeployment();

  console.log(
    "OPNNativePointsStaking deployed to:",
    await staking.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});