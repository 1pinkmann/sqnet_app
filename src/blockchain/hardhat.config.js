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
      url: 'https://eth-goerli.g.alchemy.com/v2/YVShjDe4GveVzvqGaHtVvncfsJf9IyCE',
      accounts: ['a84c8e4e9f7747048b758895a69fb6e9b22aa2746453efd8fd8ef60ca09aac17'],
    },
    mainNet: {
      url: 'https://mainnet.infura.io/v3/e95eeda83f4e45f0ba8f79adb530310f',
      accounts: ['a84c8e4e9f7747048b758895a69fb6e9b22aa2746453efd8fd8ef60ca09aac17'],
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      accounts: ['4f5c6efa7230fcfcc82dda3ea36480392d63b7a2f46c9beba0245ba66e45d543'],
    },
    bnb: {
      url: 'https://bsc-testnet.public.blastapi.io',
      accounts: ['a84c8e4e9f7747048b758895a69fb6e9b22aa2746453efd8fd8ef60ca09aac17'],
    }
  }
};
