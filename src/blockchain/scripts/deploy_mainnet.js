// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const SQNKAbi = require("../artifacts/contracts/SQNK.sol/SQNK.json").abi;

const PANCAKE_ROUTER = '0xEfF92A263d31888d860bD50809A8D171709b7b1c';
const PANCAKE_FACTORY = '0x1097053Fd2ea711dad45caCcc45EfF7548fCB362';

async function main() {
  let factory;
  let sqnk;
  let router;
  let pairAddress;
  let sqnet;
  let sqnetRouter;
  const ONE_TOKEN = (10 ** 18).toString();

  const owner = '0xf04410F48128CAe1409945720c1384335aa4f7e6';
  const rewardWallet = '0xC9BfC6946cC4fa2bf99728521B77C91ab0CDc49F';
  const marketingWallet = '0x343DaE1d573a9960600da5b3c892F936f209ADDD';

  const getUsdt = async () => {
    // usdt = await ethers.getContractAt(USDTAbi, USDT_ADDRESS);
  }

  const deploySqnk = async () => {
    const SQNK = await ethers.getContractFactory("SQNK");
    sqnk = await SQNK.deploy('Squid Network', 'SQNK', marketingWallet, rewardWallet);
    await sqnk.deployed();
    console.log('SQNK ADDRESS', sqnk.address);
    // await sqnk.transferOwnership(owner.address);
  }

  // const getPair = async () => {
    // const createTrx = await factory.createPair(sqnk.address, usdt.address);
    // await createTrx.wait();
    // pairAddress = await factory.getPair(sqnk.address, usdt.address);
    // pair = await ethers.getContractAt(PairABI, pairAddress);

    // console.log(await factory.pairCodeHash());
  // }

  // const deploySqnet = async () => {
  //   const SQNET = await ethers.getContractFactory("SQNET");
  //   sqnet = await SQNET.deploy(router.address, sqnk.address, usdt.address, pairAddress);
  //   await sqnet.deployed();

  //   await sqnk.setSqnetAddress(sqnet.address);
  // }

  await deploySqnk();
  // await deploySqnet();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
