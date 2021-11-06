import chai from "chai";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
const { expect } = chai;

chai.use(solidity);

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

describe("Hodor", () => {
  let ownerAddress: SignerWithAddress,
    secondAddress: SignerWithAddress,
    thirdAddress: SignerWithAddress;

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

      const contractBalance = await hodor.totalEther();
      expect(contractBalance).to.equal(initialEtherSent);
    });
  });

  describe("contributing ether", () => {
    it("allows sending new ether to the contract", async () => {
      const hodor = await getDeployedContract();

      await ownerAddress.sendTransaction({
        to: hodor.address,
        value: ethers.utils.parseEther("1"),
      });

      const contractBalance = await hodor.totalEther();
      expect(contractBalance).to.equal(ethers.utils.parseEther("1"));
    });

    it("allows any address to send ether to the contract", async () => {
      const hodor = await getDeployedContract();

      await secondAddress.sendTransaction({
        to: hodor.address,
        value: ethers.utils.parseEther("1"),
      });

      await thirdAddress.sendTransaction({
        to: hodor.address,
        value: ethers.utils.parseEther("0.1"),
      });

      const contractBalance = await hodor.totalEther();
      expect(contractBalance).to.equal(ethers.utils.parseEther("1.1"));
    });

    it("increases the contract totalEther self-tracking variable correctly", async () => {
      const hodor = await getDeployedContract();

      for (let i = 0; i < 10; i++) {
        await ownerAddress.sendTransaction({
          to: hodor.address,
          value: ethers.utils.parseEther("0.1"),
        });
      }

      const contractBalance = await hodor.totalEther();
      expect(contractBalance).to.equal(ethers.utils.parseEther("1"));
    });

    it("emits a ReceiveEther event", async () => {
      const hodor = await getDeployedContract();

      const txn = await ownerAddress.sendTransaction({
        to: hodor.address,
        value: ethers.utils.parseEther("1"),
      });

      expect(txn)
        .to.emit(hodor, "ReceiveEther")
        .withArgs(ethers.utils.parseEther("1"));
    });
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
