"use strict";

require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{
      version: ">=0.6.0 <0.8.0"
    }, {
      version: "0.5.16"
    }, {
      version: "0.6.6"
    }]
  },
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/nTSHFWVFTlSDTU3kH5E2pmPmg1adi0zP',
      accounts: ['6e33886c633c0d420374334dabae7bfc55a5003b1659957dfdaeac52bb2f92ee']
    }
  }
};