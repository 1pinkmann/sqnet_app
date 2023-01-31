pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TKN is ERC20 {
  address public owner;
  constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) public {
    owner = msg.sender;
    mint(msg.sender, 10000 * 1e18);
  }

  function mint(address to, uint amount) public {
    require(msg.sender == owner, 'Only owner');
    require(to != address(0), 'Empty address');
    require(amount > 0, 'No amount');
    _mint(to, amount);
  }
}