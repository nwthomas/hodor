// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
  mapping(address => uint256) public balances;
  mapping(address => mapping(address => uint256)) public allowed;

  constructor() ERC20("MockERC20", "M20") {}
}
