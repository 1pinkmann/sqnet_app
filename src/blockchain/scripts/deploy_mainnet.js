// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const SQNKAbi = require("../artifacts/contracts/SQNK.sol/SQNK.json").abi;

async function main() {
  let sqnk;
  let sqnet;

  const PANCAKE_ROUTER = '0xEfF92A263d31888d860bD50809A8D171709b7b1c';
  const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const OWNER_ADDRESS = '0xf04410F48128CAe1409945720c1384335aa4f7e6';
  const REWARD_WALLET_ADDRESS = '0xC9BfC6946cC4fa2bf99728521B77C91ab0CDc49F';
  const MARKETING_WALLET_ADDRESS = '0x343DaE1d573a9960600da5b3c892F936f209ADDD';

  const deploySqnk = async () => {
    const SQNK = await ethers.getContractFactory("SQNK");
    sqnk = await SQNK.deploy('Squid Network', 'SQNK', MARKETING_WALLET_ADDRESS, REWARD_WALLET_ADDRESS, OWNER_ADDRESS);
    await sqnk.deployed();
    console.log('SQNK ADDRESS', sqnk.address);
  }

  const getSQNK = async () => {
    sqnk = await ethers.getContractAt(SQNKAbi, '0x61CAd8b63E45069Bb7f967fA87c9F39F05f5fdcA');
  }

  const deploySqnet = async () => {
    const SQNET = await ethers.getContractFactory("SQNET");
    sqnet = await SQNET.deploy(PANCAKE_ROUTER, sqnk.address, USDT_ADDRESS);
    await sqnet.deployed();
    console.log('SQNET ADDRESS', sqnet.address);
    await sqnk.setSqnetAddress(sqnet.address);
  }

  // await deploySqnk();
  await getSQNK();
  await deploySqnet();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
