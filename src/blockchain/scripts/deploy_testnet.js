// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const PairABI = require("../artifacts/contracts/core/UniswapV2Pair.sol/UniswapV2Pair.json").abi;
const RouterABI = require("../artifacts/contracts/periphery/UniswapV2Router02.sol/UniswapV2Router02.json").abi;
const FactoryABI = require("../artifacts/contracts/core/UniswapV2Factory.sol/UniswapV2Factory.json").abi;
const TKNAbi = require("../artifacts/contracts/core/TKN.sol/TKN.json").abi;
const SQTAbi = require("../artifacts/contracts/SQT.sol/SQT.json").abi;

const PANCAKE_ROUTER = '0xeff92a263d31888d860bd50809a8d171709b7b1c';
const PANCAKE_FACTORY = '0x1097053Fd2ea711dad45caCcc45EfF7548fCB362';
const PANCAKE_WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';

async function main() {
  let factory;
  let sqt;
  let usdt;
  let router;
  let pair;
  let sqnet;
  let dao;
  let usdc;
  const ONE_TOKEN = (10 ** 18).toString();

  // const [owner, account1, buyer, rewardWallet, marketingWallet] = await ethers.getSigners();
  const owner = '0xBE5dd7E8982e493BfFb746f5A86876baDb391078';
  const buyer = '0x20a361F671EC47A5bE9F2bf828A6cCB2e39bf402';
  const rewardWallet = '0x1bd9652c0ad7b6a71a3C16603844FBb5cCE69E99';
  const marketingWallet = '0x3a4bdfdDF5CB7bfeE236e50495Ae2CA5BD4F6cFC';

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

    usdt = await ethers.getContractAt(TKNAbi, '0x9E1bA6DD8B2E2d84072820802093e46C24d7EB9d');
    dao = await ethers.getContractAt(TKNAbi, '0x97917Fc075f25E71ce177381b4d9Beb2a53e8DF6');
    usdc = await ethers.getContractAt(TKNAbi, '0x80c324364D98320eae65c6f2E68d58e0360a5aC7');
    sqt = await ethers.getContractAt(SQTAbi, '0x2596454C4341e1c05d34cb298062d1aBb18B76Be');

    // const SQT = await ethers.getContractFactory("SQT");
    // sqt = await SQT.deploy('SQT', 'SQT', marketingWallet, rewardWallet);
    // await sqt.deployed();
    // console.log(sqt.address);
    // const createTrx = await factory.createPair(sqt.address, usdt.address);
    // await createTrx.wait();
    // const pairAddress = await factory.getPair(sqt.address, usdt.address);
    // pair = await ethers.getContractAt(PairABI, pairAddress);

    // console.log(await factory.pairCodeHash());
  }

  const deploySqnet = async () => {
    const SQNET = await ethers.getContractFactory("SQNET");
    sqnet = await SQNET.deploy(router.address, sqt.address);
    await sqnet.deployed();

    await sqt.setSqnetAddress(sqnet.address);
  }

  const mintBalance = async () => {
    await sqt.transfer(buyer, (ONE_TOKEN * 300).toString());
    await usdt.transfer(buyer, (ONE_TOKEN * 300).toString());
  }

  const addInitialLiquidities = async () => {
    const amountToAdd = (ONE_TOKEN * 5).toString();

    await sqt.approve(router.address, (amountToAdd * 10).toString());
    await usdt.approve(router.address, (amountToAdd * 10).toString());
    await usdc.approve(router.address, (amountToAdd * 10).toString());
    await dao.approve(router.address, (amountToAdd * 10).toString());

    await router.addLiquidityETH(
      usdt.address,
      amountToAdd,
      0,
      ethers.utils.parseEther("0.05"),
      owner,
      Math.round((Date.now() + 86400 * 2) / 1000),
      { value: ethers.utils.parseEther("0.1") }
    );

    await sqt.approve(router.address, amountToAdd);

    await router.addLiquidity(
      sqt.address,
      usdt.address,
      amountToAdd,
      amountToAdd,
      amountToAdd,
      amountToAdd,
      owner,
      Math.round((Date.now() + 86400 * 2) / 1000)
    );

    await router.addLiquidity(
      usdt.address,
      dao.address,
      amountToAdd,
      amountToAdd,
      amountToAdd,
      amountToAdd,
      owner,
      Math.round((Date.now() + 86400 * 2) / 1000)
    );

    await router.addLiquidity(
      usdt.address,
      usdc.address,
      amountToAdd,
      amountToAdd,
      amountToAdd,
      amountToAdd,
      owner,
      Math.round((Date.now() + 86400 * 2) / 1000)
    );
  }

  await getPancakeFactory();
  await getPancakeRouter();
  await createPair();
  await deploySqnet();
  // await mintBalance();
  // await addInitialLiquidities();

  console.log('USDT ADDRESS', usdt.address);
  console.log('SQT ADDRESS', sqt.address);
  console.log('DAO ADDRESS', dao.address);
  console.log('USDC ADDRESS', usdc.address);
  console.log('SQNET ADDRESS', sqnet.address);
  // console.log('SQT/USDT PAIR ADDRESS', pair.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
