// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Hodor is Ownable {
  uint256 public unlockTime;
  uint256 public totalEther;

  mapping(address => uint256) public erc20TokensToAmounts;
  mapping(address => bool) public erc721ToIndex;
  uint256[] public erc721TokenIDs;

  // TODO: Track all types of tokens and NFTs sent to contract and send them back
  // out when requested

  modifier isUnlocked() {
    require(block.timestamp >= unlockTime, "Error: Contract is locked.");
    _;
  }

  event ReceiveEther(uint256 etherAmount);
  event ReceiveToken(address tokenAddress, uint256 tokenAmount);
  event TransferEther(address payableAddress, uint256 etherAmount);
  event TransferToken(
    address payableAddress,
    address tokenAddress,
    uint256 tokenAmount
  );

  constructor(uint256 _timeToLockSeconds) payable {
    if (msg.value > 0) {
      totalEther += msg.value;
      emit ReceiveEther(msg.value);
    }

    unlockTime = block.timestamp + _timeToLockSeconds;
  }

  receive() external payable {
    uint256 newEther = msg.value;
    totalEther += newEther;
    emit ReceiveEther(msg.value);
  }

  function receiveToken() external onlyOwner {
    // TODO: Track tokens and NFTs sent
  }

  function retrieveEther(address _payableAddress)
    external
    payable
    onlyOwner
    isUnlocked
  {
    if (totalEther > 0) {
      uint256 currentTotalEther = totalEther;
      totalEther = 0;
      (bool success, ) = _payableAddress.call{ value: currentTotalEther }("");
      require(success, "Error: Transfer failed.");
      emit TransferEther(_payableAddress, totalEther);
    }
  }

  function retrieveToken(address _payableAddress, address _tokenAddress)
    external
    onlyOwner
    isUnlocked
  {
    // finish
  }
}
