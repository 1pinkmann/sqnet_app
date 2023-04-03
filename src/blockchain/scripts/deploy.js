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
const SQTAbi = require("../artifacts/contracts/SQT.sol/SQT.json").abi;
// const USDTAbi = require("../artifacts/contracts/core/ERC20.sol/ERC20.json").abi;

const PANCAKE_ROUTER = '0xeff92a263d31888d860bd50809a8d171709b7b1c';
const PANCAKE_FACTORY = '0x1097053Fd2ea711dad45caCcc45EfF7548fCB362';
const PANCEKE_WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
const USDT_ADDRESS = '0x1a4302EAF1aE103830BfEdd3126Dfe1b74b9dFD5';
const SQT_ADDRESS = '0x56823A9273ba6eC8dE3aDA452f44a0C0152cFEd1'

async function main() {
  let factory;
  let sqt;
  let usdt;
  let router;
  let weth;
  let pairAddress;
  let sqnet;
  let sqnetRouter;
  let dao;
  let usdc;
  const ONE_TOKEN = (10 ** 18).toString();

  // const [owner, account1, buyer, rewardWallet, marketingWallet] = await ethers.getSigners();
  const owner = '0xf04410F48128CAe1409945720c1384335aa4f7e6';
  const buyer = '0x20a361F671EC47A5bE9F2bf828A6cCB2e39bf402';
  const rewardWallet = '0xC9BfC6946cC4fa2bf99728521B77C91ab0CDc49F';
  const marketingWallet = '0x343DaE1d573a9960600da5b3c892F936f209ADDD';

  // const deployFactory = async () => {
  //   const Factory = await ethers.getContractFactory("UniswapV2Factory");
  //   factory = await Factory.deploy(owner);
  //   await factory.deployed();
  // }

  // const deployRouter = async () => {
  //   const WETH = await ethers.getContractFactory("WETH");
  //   weth = await WETH.deploy();
  //   await weth.deployed();

  //   const Router = await ethers.getContractFactory("UniswapV2Router02");
  //   router = await Router.deploy(factory.address, weth.address);
  //   await router.deployed();
  // }
  
  const getPancakeFactory = async () => {
    factory = await ethers.getContractAt(FactoryABI, PANCAKE_FACTORY);
  }

  const getPancakeRouter = async () => {
    router = await ethers.getContractAt(RouterABI, PANCAKE_ROUTER);
  }

  const getSqt = async () => {
    sqt = await ethers.getContractAt(SQTAbi, SQT_ADDRESS);
  }

  const getUsdt = async () => {
    // usdt = await ethers.getContractAt(USDTAbi, USDT_ADDRESS);
  }

  const deploySqt = async () => {
    // const USDT = await ethers.getContractFactory("TKN");
    // usdt = await USDT.deploy('USDT', 'USDT');
    // await usdt.deployed();

    // const DAO = await ethers.getContractFactory("TKN");
    // dao = await DAO.deploy('DAO', 'DAO');
    // await dao.deployed();

    // const USDC = await ethers.getContractFactory("TKN");
    // usdc = await USDC.deploy('USDC', 'USDC');
    // await usdc.deployed();

    const SQT = await ethers.getContractFactory("SQT");
    sqt = await SQT.deploy('Squid Network', 'SNE', marketingWallet, rewardWallet);
    await sqt.deployed();
  }

  const getPair = async () => {
    // const createTrx = await factory.createPair(sqt.address, usdt.address);
    // await createTrx.wait();
    pairAddress = await factory.getPair(sqt.address, usdt.address);
    // pair = await ethers.getContractAt(PairABI, pairAddress);

    // console.log(await factory.pairCodeHash());
  }

  const deploySqnet = async () => {
    const SQNET = await ethers.getContractFactory("SQNET");
    sqnet = await SQNET.deploy(router.address, sqt.address, usdt.address, pairAddress);
    await sqnet.deployed();

    await sqt.setSqnetAddress(sqnet.address);
  }

  const mintBalance = async () => {
    await sqt.transfer(buyer, (ONE_TOKEN * 10).toString());
    await usdt.transfer(buyer, (ONE_TOKEN * 10).toString());
  }

  async function awaitTrx(transaction) {
    const trx = await transaction();
    await trx.wait();
  }

  const addInitialLiquidities = async () => {
    const amountToAdd = (ONE_TOKEN * 5).toString();

    await sqt.approve(router.address, (amountToAdd * 10).toString());
    await usdt.approve(router.address, (amountToAdd * 10).toString());
    await usdc.approve(router.address, (amountToAdd * 10).toString());
    await dao.approve(router.address, (amountToAdd * 10).toString());


    await sqt.setTaxEnabled(false);

    await router.addLiquidityETH(
      usdt.address,
      amountToAdd,
      0,
      ethers.utils.parseEther("0.02"),
      owner,
      Math.round((Date.now() + 86400 * 2) / 1000),
      { value: ethers.utils.parseEther("0.05") }
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

    await sqt.setTaxEnabled(true);
  }

  // await getPancakeFactory();
  // await getPancakeRouter();
  // await getSqt();
  // await getUsdt();
  await deploySqt();
  // await getPair();
  // await deploySqnet();
  // await mintBalance();
  // await addInitialLiquidities();

  // console.log('ROUTER ADDRESS', router.address);
  // console.log('USDT ADDRESS', usdt.address);
  console.log('SQT ADDRESS', sqt.address);
  // console.log('DAO ADDRESS', dao.address);
  // console.log('USDC ADDRESS', usdc.address);
  // console.log('SQNET ADDRESS', sqnet.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
