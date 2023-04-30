// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "hardhat/console.sol";

contract AirDrop is Ownable {

  // This declares a state variable that would store the contract address
  IERC20 public tokenInstance;

  /*
    constructor function to set token address
   */
  constructor(address _tokenAddress) public {
    tokenInstance = IERC20(_tokenAddress);
  }

  /*
    Airdrop function which take up a array of address, single token amount and eth amount and call the
    transfer function to send the token plus send eth to the address is balance is 0
   */
  function doAirDrop(address[] memory _address, uint256 _amount) onlyOwner public returns (bool) {
    uint256 count = _address.length;
    for (uint256 i = 0; i < count; i++) {
      /* calling transfer function from contract */
      tokenInstance.transfer(_address [i],_amount);
    }
  }

  /*
    Airdrop function which take up a array of address, indvidual token amount and eth amount
   */
  function sendBatch(address[] memory _recipients, uint[] memory _values) onlyOwner public returns (bool) {
    require(_recipients.length == _values.length);
    for (uint i = 0; i < _values.length; i++) {
      tokenInstance.transferFrom(msg.sender, _recipients[i], _values[i]);
    }
    return true;
  }
}