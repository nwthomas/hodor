import chai from "chai";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
const { expect } = chai;

chai.use(solidity);

const getDeployedHodorContract = async (
  timeToLockSeconds: number = 10000,
  initialEtherSent?: ReturnType<typeof ethers.utils.parseEther>
) => {
  const HodorContractFactory = await ethers.getContractFactory("Hodor");
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
      const hodor = await getDeployedHodorContract(additionalUnlockTimeSeconds);
      await ethers.provider.send("evm_mine", []);

      const unlockTimeSeconds = await hodor.unlockTimeSeconds();
      expect(unlockTimeSeconds).to.equal(
        deployTimeSeconds + additionalUnlockTimeSeconds
      );
    });

    it("defines the owner on instantiation", async () => {
      const hodor = await getDeployedHodorContract();
      const contractOwner = await hodor.owner();
      expect(contractOwner).to.equal(ownerAddress.address);
    });

    it("allows contribution of ether by owner during instantiation", async () => {
      const initialEtherSent = ethers.utils.parseEther("0.1");
      const hodor = await getDeployedHodorContract(1, initialEtherSent);

      const contractBalance = await hodor.totalEther();
      expect(contractBalance).to.equal(initialEtherSent);
    });
  });

  describe("contributing ether", () => {
    it("allows sending new ether to the contract", async () => {
      const hodor = await getDeployedHodorContract();

      await ownerAddress.sendTransaction({
        to: hodor.address,
        value: ethers.utils.parseEther("1"),
      });

      const contractBalance = await hodor.totalEther();
      expect(contractBalance).to.equal(ethers.utils.parseEther("1"));
    });

    it("allows any address to send ether to the contract", async () => {
      const hodor = await getDeployedHodorContract();

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
      const hodor = await getDeployedHodorContract();

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
      const hodor = await getDeployedHodorContract();

      const txn = await ownerAddress.sendTransaction({
        to: hodor.address,
        value: ethers.utils.parseEther("1"),
      });

      expect(txn)
        .to.emit(hodor, "ReceiveEther")
        .withArgs(ethers.utils.parseEther("1"));
    });
  });

  describe("withdrawing ether", async () => {
    it("allows withdrawal of ether after the unlock time has passed", async () => {
      const deployTimeSeconds = Date.now();
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        deployTimeSeconds,
      ]);

      const additionalUnlockTimeSeconds = 100;
      const hodor = await getDeployedHodorContract(
        additionalUnlockTimeSeconds,
        ethers.utils.parseEther("1")
      );
      await ethers.provider.send("evm_mine", []);

      await ethers.provider.send("evm_setNextBlockTimestamp", [
        deployTimeSeconds + additionalUnlockTimeSeconds,
      ]);
      const txn = await hodor.retrieveEther(ownerAddress.address);
      await ethers.provider.send("evm_mine", []);

      expect(txn)
        .to.emit(hodor, "TransferEther")
        .withArgs(ownerAddress.address, ethers.utils.parseEther("1"));
    });

    it("throws an error if the unlock time has not passed", async () => {
      const deployTimeSeconds = Date.now();
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        deployTimeSeconds,
      ]);

      const additionalUnlockTimeSeconds = 100;
      const hodor = await getDeployedHodorContract(
        additionalUnlockTimeSeconds,
        ethers.utils.parseEther("1")
      );
      await ethers.provider.send("evm_mine", []);

      let error;
      try {
        await hodor.retrieveEther(ownerAddress.address);
      } catch (newError) {
        error = newError;
      }

      expect(error instanceof Error).to.equal(true);
      expect(String(error).indexOf("Error: Contract is locked") > 1).to.equal(
        true
      );
    });

    it("throws an error if an address other than owner calls it", async () => {
      const deployTimeSeconds = Date.now();
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        deployTimeSeconds,
      ]);

      const additionalUnlockTimeSeconds = 100;
      const hodor = await getDeployedHodorContract(
        additionalUnlockTimeSeconds,
        ethers.utils.parseEther("1")
      );
      await ethers.provider.send("evm_mine", []);

      let error;
      try {
        await hodor.connect(secondAddress).retrieveEther(ownerAddress.address);
      } catch (newError) {
        error = newError;
      }

      expect(error instanceof Error).to.equal(true);
      expect(
        String(error).indexOf("Ownable: caller is not the owner") > 1
      ).to.equal(true);
    });

    it("throws an error if there is no ether in the contract", async () => {
      const deployTimeSeconds = Date.now();
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        deployTimeSeconds,
      ]);

      const additionalUnlockTimeSeconds = 100;
      const hodor = await getDeployedHodorContract(
        0,
        ethers.utils.parseEther("0")
      );
      await ethers.provider.send("evm_mine", []);

      let error;
      try {
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          deployTimeSeconds + additionalUnlockTimeSeconds,
        ]);
        await hodor.retrieveEther(ownerAddress.address);
      } catch (newError) {
        error = newError;
      }

      expect(error instanceof Error).to.equal(true);
      expect(String(error).indexOf("Error: No ether in contract") > 1).to.equal(
        true
      );
    });
  });

  describe("withdrawing ERC20", () => {
    // finish
  });

  describe("withdrawing ERC721", () => {
    // finish
  });
});
