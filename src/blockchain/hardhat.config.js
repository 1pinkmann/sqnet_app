require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: ">=0.6.0 <0.8.0"
      },
      {
        version: "0.5.16",
      },
      {
        version: "0.6.6",
      },
    ],
  },
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/H02AY2QKFEwsAHeqZF-wLylAdy0y-Of7',
      accounts: ['545a02757f29a14ade72d5e824da529d0007264eea67366ce7bc21ce394b631d'],
    },
    mainNet: {
      url: 'https://mainnet.infura.io/v3/e95eeda83f4e45f0ba8f79adb530310f',
      accounts: ['a84c8e4e9f7747048b758895a69fb6e9b22aa2746453efd8fd8ef60ca09aac17'],
    }
  }
};
