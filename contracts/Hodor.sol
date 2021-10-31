// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Hodor is Ownable {
  uint256 public unlockTime;
  uint256 public totalEther;

  // TODO: Track constraints like time in order to decide when to unlock contract

  // TODO: Track all types of tokens and NFTs sent to contract and send them back
  // out when requested

  event TransferEther(address payableAddress, uint256 etherAmount);

  constructor() payable {
    totalEther += msg.value;
  }

  receive() external payable onlyOwner {
    uint256 newEther = msg.value;
    totalEther += newEther;

    // TODO: Track tokens and NFTs sent
  }

  function retrieveValuables(address _payableAddress)
    external
    payable
    onlyOwner
  {
    if (totalEther > 0) {
      uint256 currentTotalEther = totalEther;
      totalEther = 0;
      (bool success, ) = _payableAddress.call{ value: currentTotalEther }("");
      require(success, "Error: Transfer failed.");
      emit TransferEther(_payableAddress, totalEther);
    }

    // TODO: Transfer any tokens and NFT owned by contract
  }
}
