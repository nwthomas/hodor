import hre from "hardhat";

const main = async () => {
  const hodorContractFactory = await hre.ethers.getContractFactory("Hodor");
  const hodorContract = await hodorContractFactory.deploy();
  await hodorContract.deployed();
  console.log("Contract deployed to:", hodorContract.address);

  const txn = await hodorContract.contributionLimit();
  await txn.wait();
  console.log("Contribution limit: ", txn);
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
