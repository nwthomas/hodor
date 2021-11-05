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
    maximumContribution: number = 10 ** 18,
    minimumContribution: number = ethers.utils.parseEther("0.1").toNumber(),
    maximumContributors: number = 100
  ) => {
    const EthDistributor = await ethers.getContractFactory(contractName);
    const ethDistributor = await EthDistributor.deploy(
      maximumContribution,
      minimumContribution,
      maximumContributors
    );

    return ethDistributor;
  };

  beforeEach(async () => {
    const [owner, second, third] = await ethers.getSigners();

    ownerAddress = owner;
    secondAddress = second;
    thirdAddress = third;
  });

  describe("constructor", () => {
    // finish
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
