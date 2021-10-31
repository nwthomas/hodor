// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Hodor is Ownable {
  address public payableAddress;

  constructor() {
    payableAddress = msg.sender;
  }

  receive() external payable onlyOwner {
    // receive ether
  }
}
