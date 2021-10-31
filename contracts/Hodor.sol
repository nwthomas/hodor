// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title A contract for hodling ether, ERC20, and ERC721 tokens for a predefined period of time
/// @author Nathan Thomas
/// @notice This contract is not audited - USE AT YOUR OWN RISK!
contract Hodor is Ownable {
  // This is necessary to check if a given provided address supports the
  // ERC721 interface definition. It's pulled from:
  // https://stackoverflow.com/questions/45364197/how-to-detect-if-an-ethereum-address-is-an-erc20-token-contract
  bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;
  /*
   * 0x80ac58cd ===
   *   bytes4(keccak256('balanceOf(address)')) ^
   *   bytes4(keccak256('ownerOf(uint256)')) ^
   *   bytes4(keccak256('approve(address,uint256)')) ^
   *   bytes4(keccak256('getApproved(uint256)')) ^
   *   bytes4(keccak256('setApprovalForAll(address,bool)')) ^
   *   bytes4(keccak256('isApprovedForAll(address,address)')) ^
   *   bytes4(keccak256('transferFrom(address,address,uint256)')) ^
   *   bytes4(keccak256('safeTransferFrom(address,address,uint256)')) ^
   *   bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)'))
   */

  uint256 public unlockTimeSeconds;
  uint256 public totalEther;

  event ReceiveEther(uint256 etherAmount);
  event TransferEther(address payableAddress, uint256 etherAmount);
  event TransferERC20Token(
    address payableAddress,
    address tokenAddress,
    uint256 tokenAmount
  );
  event TransferERC721Token(
    address payableAddress,
    address tokenAddress,
    uint256 tokenId
  );

  modifier isUnlocked() {
    require(block.timestamp >= unlockTimeSeconds, "Error: Contract is locked");
    _;
  }

  modifier isValidERC721Address(address _tokenAddress) {
    require(
      IERC721(_tokenAddress).supportsInterface(_INTERFACE_ID_ERC721),
      "Error: The token address does not support ERC721"
    );
    _;
  }

  /// @notice Instantiates a new contract with a predefined period of time to lock the contract
  /// for forced hodling
  /// @param _timeToLockSeconds The amount of time in seconds to lock the contract
  /// @dev Ether can be send to this contract on instantiation
  constructor(uint256 _timeToLockSeconds) payable {
    if (msg.value > 0) {
      totalEther += msg.value;
      emit ReceiveEther(msg.value);
    }

    unlockTimeSeconds = block.timestamp + _timeToLockSeconds;
  }

  /// @notice Allows any address to contribute to the contract (regardless of ownership status)
  receive() external payable {
    uint256 newEther = msg.value;
    totalEther += newEther;
    emit ReceiveEther(msg.value);
  }

  /// @notice Allows the owner to retrieve all ether from the contract if the forced hodling
  /// period has been passed
  /// @param _payableAddress The address that the ether should be sent to
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
      require(success, "Error: Transfer failed");
      emit TransferEther(_payableAddress, totalEther);
    }
  }

  /// @notice Allows the owner to retrieve all ERC20 tokens to a specified payable wallet
  /// address from a specified token contract address if the forced hodling period has been
  /// passed
  /// @param _payableAddress The address that the ERC20 tokens should be sent to
  /// @param _tokenAddress The ERC20 token contract address
  function retrieveERC20Tokens(address _payableAddress, address _tokenAddress)
    external
    onlyOwner
    isUnlocked
  {
    uint256 amount = IERC20(_tokenAddress).balanceOf(address(this));

    require(
      amount > 0,
      string(
        abi.encodePacked(
          "Error: This contract has no ERC20 tokens from ",
          _tokenAddress
        )
      )
    );

    bool isSuccess = IERC20(_tokenAddress).transfer(_payableAddress, amount);
    require(isSuccess, "Error: The tokens could not be transferred");
    emit TransferERC20Token(_payableAddress, _tokenAddress, amount);
  }

  /// @notice Allows the owner to send a specific ERC721 token to a specified payable wallet
  /// address from a specified token contract address if the forced hodling period has been
  /// passed
  /// @param _payableAddress The address that the ERC721 token should be sent to
  /// @param _tokenAddress The ERC721 token contract address
  /// @param _tokenId The unique ID of the ERC721 token that should be sent to the _payableAddress
  function retriveERC721Token(
    address _payableAddress,
    address _tokenAddress,
    uint256 _tokenId
  ) external onlyOwner isUnlocked isValidERC721Address(_tokenAddress) {
    require(
      IERC721(_tokenAddress).balanceOf(address(this)) > 0,
      string(
        abi.encodePacked(
          "Error: This contract has no ERC721 tokens from ",
          _tokenAddress
        )
      )
    );

    require(
      IERC721(_tokenAddress).ownerOf(_tokenId) == address(this),
      "Error: This contract does not own that ERC721 token"
    );

    IERC721(_tokenAddress).safeTransferFrom(
      address(this),
      _payableAddress,
      _tokenId
    );
    emit TransferERC721Token(_payableAddress, _tokenAddress, _tokenId);
  }
}
