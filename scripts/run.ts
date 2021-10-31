import hre from "hardhat";

const main = async () => {
  const hodorContractFactory = await hre.ethers.getContractFactory("Hodor");
  const hodorContract = await hodorContractFactory.deploy();
  await hodorContract.deployed();
  console.log("Contract deployed to:", hodorContract.address);
};

async function runMain() {
  try {
    await main();
    process.exitCode = 0;
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  }
}

runMain();
