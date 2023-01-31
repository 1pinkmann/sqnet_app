pragma solidity >=0.5.0;

import '../core/interfaces/IERC20.sol';

interface ISQT is IERC20 {
  function transferTaxesFrom(address from, address to, uint value) external returns (bool);
  function setTaxEnabled(bool status) external;
  function marketingWallet() external returns(address);
  function rewardWallet() external returns(address);
  function approveMarketingWallet(uint amount) external;
  function getMarketingTax() external returns(uint);
  function getRewardTax() external returns(uint);
  function getLiquidityTax() external returns(uint);
  function approveRewardWallet(uint amount) external;
  function admins(address) external returns(bool);
}
