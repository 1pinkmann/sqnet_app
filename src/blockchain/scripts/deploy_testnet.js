// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
// const PairABI = require("../artifacts/contracts/core/UniswapV2Pair.sol/UniswapV2Pair.json").abi;
const RouterABI = require("../artifacts/contracts/periphery/UniswapV2Router02.sol/UniswapV2Router02.json").abi;
const FactoryABI = require("../artifacts/contracts/core/UniswapV2Factory.sol/UniswapV2Factory.json").abi;
const TKNAbi = require("../artifacts/contracts/core/TKN.sol/TKN.json").abi;
const SQNKAbi = require("../artifacts/contracts/SQNK.sol/SQNK.json").abi;

const PANCAKE_FACTORY = '0x6725F303b657a9451d8BA641348b6761A6CC7a17';
const PANCAKE_ROUTER = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';

async function main() {
  let factory;
  let sqnk;
  let usdt;
  let router;
  let weth;
  let sqnet;
  let dao;
  let usdc;
  const ONE_TOKEN = (10 ** 18).toString();

  // const [owner, account1, buyer, rewardWallet, marketingWallet] = await ethers.getSigners();
  const owner = '0x1EA8D13184356100B01f48525C57B0A7eF89CE77';
  const buyer = '0x95F9cBf911400D2B551A9276D8D7d9e9c0fb191a';
  const rewardWallet = '0x501b807055006c20d3B94582B96dcdf5aD695a0a';
  const marketingWallet = '0x76b4556bFD6419CEae98e20670f377988F797FDE';

  const getPancakeFactory = async () => {
    factory = await ethers.getContractAt(FactoryABI, PANCAKE_FACTORY);
  }

  const getPancakeRouter = async () => {
    router = await ethers.getContractAt(RouterABI, PANCAKE_ROUTER);
  }

  const createPair = async () => {
    // const USDT = await ethers.getContractFactory("TKN");
    // usdt = await USDT.deploy('USDT', 'USDT');
    // await usdt.deployed();

    // const DAO = await ethers.getContractFactory("TKN");
    // dao = await DAO.deploy('DAO', 'DAO');
    // await dao.deployed();

    // const USDC = await ethers.getContractFactory("TKN");
    // usdc = await USDC.deploy('USDC', 'USDC');
    // await usdc.deployed();

    usdt = await ethers.getContractAt(TKNAbi, '0xe74ebA94EB1EE7A709ee2c030513C030b6cA771e');
    dao = await ethers.getContractAt(TKNAbi, '0x284502da80D2fF9c6D347649B2d39B38f25Bf0A0');
    usdc = await ethers.getContractAt(TKNAbi, '0x089B4BF9fE065E58D2c61A736e1f8f34fC8eEfec');
    sqnk = await ethers.getContractAt(SQNKAbi, '0xd6dBc0eb6D6830A227fA6d28386A9551c78d0d91');

    // const SQNK = await ethers.getContractFactory("SQNK");
    // sqnk = await SQNK.deploy('SQNK', 'SQNK', marketingWallet, rewardWallet);
    // await sqnk.deployed();
    // console.log(sqnk.address);
    // const createTrx = await factory.createPair(sqnk.address, usdt.address);
    // await createTrx.wait();
    // const pairAddress = await factory.getPair(sqnk.address, usdt.address);
    // pair = await ethers.getContractAt(PairABI, pairAddress);

    // console.log(await factory.pairCodeHash());
  }

  const deploySqnet = async () => {
    const SQNET = await ethers.getContractFactory("SQNET");
    sqnet = await SQNET.deploy(router.address, sqnk.address, usdt.address);
    await sqnet.deployed();

    await sqnk.setSqnetAddress(sqnet.address);
  }

  const mintBalance = async () => {
    await sqnk.transfer(buyer, (ONE_TOKEN * 300).toString());
  }

  const addInitialLiquidities = async () => {
    const amountToAdd = (ONE_TOKEN * 5).toString();

    await sqnk.approve(router.address, (amountToAdd * 10).toString());
    await usdt.approve(router.address, (amountToAdd * 10).toString());
    await usdc.approve(router.address, (amountToAdd * 10).toString());
    await dao.approve(router.address, (amountToAdd * 10).toString());

    await router.addLiquidityETH(
      usdt.address,
      amountToAdd,
      0,
      ethers.utils.parseEther("0.001"),
      owner,
      Math.round((Date.now() + 86400 * 2) / 1000),
      { value: ethers.utils.parseEther("0.002") }
    );

    await sqnk.approve(router.address, amountToAdd);

    await router.addLiquidityETH(
      sqnk.address,
      amountToAdd,
      0,
      ethers.utils.parseEther("0.001"),
      owner,
      Math.round((Date.now() + 86400 * 2) / 1000),
      { value: ethers.utils.parseEther("0.002") }
    );

    await router.addLiquidityETH(
      usdt.address,
      amountToAdd,
      0,
      ethers.utils.parseEther("0.001"),
      owner,
      Math.round((Date.now() + 86400 * 2) / 1000),
      { value: ethers.utils.parseEther("0.002") }
    );

    await router.addLiquidityETH(
      usdc.address,
      amountToAdd,
      0,
      ethers.utils.parseEther("0.001"),
      owner,
      Math.round((Date.now() + 86400 * 2) / 1000),
      { value: ethers.utils.parseEther("0.002") }
    );

    await router.addLiquidityETH(
      dao.address,
      amountToAdd,
      0,
      ethers.utils.parseEther("0.001"),
      owner,
      Math.round((Date.now() + 86400 * 2) / 1000),
      { value: ethers.utils.parseEther("0.002") }
    );
  }

  await getPancakeFactory();
  await getPancakeRouter();
  await createPair();
  // await mintBalance();
  await deploySqnet();
  console.log('USDT ADDRESS', usdt.address);
  console.log('SQNK ADDRESS', sqnk.address);
  console.log('DAO ADDRESS', dao.address);
  console.log('USDC ADDRESS', usdc.address);
  console.log('SQNET ADDRESS', sqnet.address);
  console.log('ROUTER ADDRESS', router.address);
  console.log('FACTORY ADDRESS', factory.address);
  await addInitialLiquidities();

  // console.log('SQNK/USDT PAIR ADDRESS', pair.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
