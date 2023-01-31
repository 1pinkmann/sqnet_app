pragma solidity >=0.5.0;

interface ISQNET {
  function getLastClaim(address) external view returns(uint);
}
