import chai from "chai";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
const { expect } = chai;

chai.use(solidity);

describe("Hodor", () => {
  let ownerAddress: SignerWithAddress,
    secondAddress: SignerWithAddress,
    thirdAddress: SignerWithAddress;

  const getDeployedContract = async (
    contractName: string = "Hodor",
    timeToLockSeconds: number = 10000,
    initialEtherSent?: ReturnType<typeof ethers.utils.parseEther>
  ) => {
    const HodorContractFactory = await ethers.getContractFactory(contractName);
    const hodorContract = await HodorContractFactory.deploy(timeToLockSeconds, {
      value: initialEtherSent,
    });

    return hodorContract;
  };

  beforeEach(async () => {
    const [owner, second, third] = await ethers.getSigners();

    ownerAddress = owner;
    secondAddress = second;
    thirdAddress = third;
  });

  describe("constructor", () => {
    it("instantiates a new Hodor contract with provided values", async () => {
      const deployTimeSeconds = Date.now();
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        deployTimeSeconds,
      ]);

      const additionalUnlockTimeSeconds = 100;
      const hodor = await getDeployedContract(
        "Hodor",
        additionalUnlockTimeSeconds
      );
      await ethers.provider.send("evm_mine", []);

      const unlockTimeSeconds = await hodor.unlockTimeSeconds();
      expect(unlockTimeSeconds).to.equal(
        deployTimeSeconds + additionalUnlockTimeSeconds
      );
    });

    it("defines the owner on instantiation", async () => {
      const hodor = await getDeployedContract("Hodor");
      const contractOwner = await hodor.owner();
      expect(contractOwner).to.equal(ownerAddress.address);
    });

    it("allows contribution of ether by owner during instantiation", async () => {
      const initialEtherSent = ethers.utils.parseEther("0.1");
      const hodor = await getDeployedContract("Hodor", 1, initialEtherSent);

      const currentContractBalance = await hodor.totalEther();
      expect(currentContractBalance).to.equal(initialEtherSent);
    });
  });

  describe("contributing ether", () => {
    // finish
  });

  describe("contributing ERC20", () => {
    // finish
  });

  describe("contributing ERC721", () => {
    // finish
  });

  describe("withdrawing ether", () => {
    // finish
  });

  describe("withdrawing ERC20", () => {
    // finish
  });

  describe("withdrawing ERC721", () => {
    // finish
  });
});
