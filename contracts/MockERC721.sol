// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MockERC721 is ERC721 {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  event NewMockERC721TokenMinted(address sender, uint256 tokenIds);

  constructor() ERC721("Mock NFT", "Test") {}

  function mintNFT() public {
    uint256 newTokenId = _tokenIds.current();

    _safeMint(msg.sender, newTokenId);

    _tokenIds.increment();
  }
}
