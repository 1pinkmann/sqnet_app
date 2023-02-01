pragma solidity >=0.5.0;

interface ISQNET {
  function getLastClaim(address) external view returns(uint);
  function getAvailableUsdtRewards(uint sqtIn) external view returns(uint);
  function swapMarketingTaxesForETH() external;
  function claimRewards(address rewardToken0, address rewardToken1) external;
  function countSqtReward(address user) external returns(uint userReward);
}
