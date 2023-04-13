/* eslint-disable no-undef */
const { default: BigNumber } = require("bignumber.js");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const PairABI = require("../artifacts/contracts/core/UniswapV2Pair.sol/UniswapV2Pair.json").abi;

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });

describe("SQNK_ExcludeFromTaxes", function () {
  let factory;
  let sqnk;
  let usdt;
  let router;
  let weth;
  let pair;
  let sqnet;
  let dao;
  let usdc;
  const ONE_TOKEN = (10 ** 18).toString();
  const MARKETING_TAX = 0.03;
  const LIQUIDITY_TAX = 0.01;
  const REWARD_TAX = 0.06;
  const OVERALL_TAX = +(MARKETING_TAX + REWARD_TAX + LIQUIDITY_TAX).toFixed(1);

  beforeEach(async () => {
    [owner, account1, buyer, rewardWallet, marketingWallet] = await ethers.getSigners();
    await deployFactory();
    await deployRouter();
    await createPair();
    await deploySqnet();
    await mintBalance();
    await addInitialLiquidities();
  });

  deployFactory = async () => {
    const Factory = await ethers.getContractFactory("UniswapV2Factory");
    factory = await Factory.deploy(owner.address);
    await factory.deployed();
  }

  deployRouter = async () => {
    const WETH = await ethers.getContractFactory("WETH");
    weth = await WETH.deploy();
    await weth.deployed();

    const Router = await ethers.getContractFactory("UniswapV2Router02");
    router = await Router.deploy(factory.address, weth.address);
    await router.deployed();
  }

  createPair = async () => {
    const USDT = await ethers.getContractFactory("TKN");
    usdt = await USDT.deploy('USDT', 'USDT');
    await usdt.deployed();

    const DAO = await ethers.getContractFactory("TKN");
    dao = await DAO.deploy('DAO', 'DAO');
    await dao.deployed();

    const USDC = await ethers.getContractFactory("TKN");
    usdc = await USDC.deploy('USDC', 'USDC');
    await usdc.deployed();

    const SQNK = await ethers.getContractFactory("SQNK");

    sqnk = await SQNK.deploy('Squid Network', 'SQNK', marketingWallet.address, rewardWallet.address);
    await sqnk.deployed();

    // // Estimate gas cost for deployment
    // const { effectiveGasPrice, gasUsed } = await sqnk.deployTransaction.wait();
    // const cost = ethers.utils.formatEther(gasUsed.mul(effectiveGasPrice));
    // console.log(`Estimated deployment cost: ${cost} ETH`);

    await factory.createPair(sqnk.address, weth.address);
    const pairAddress = await factory.getPairAddress(sqnk.address, weth.address);
    pair = await ethers.getContractAt(PairABI, pairAddress);

    console.log('hash', await factory.pairCodeHash());
  }

  deploySqnet = async () => {
    const SQNET = await ethers.getContractFactory("SQNET");
    sqnet = await SQNET.deploy(router.address, sqnk.address, usdt.address);
    await sqnet.deployed();

    // Estimate gas cost for deployment
    const { effectiveGasPrice, gasUsed } = await sqnet.deployTransaction.wait();
    const cost = ethers.utils.formatEther(gasUsed.mul(effectiveGasPrice));
    // console.log(`Estimated deployment cost SQNET: ${cost} ETH`);

    sqnk.setSqnetAddress(sqnet.address);
  }

  mintBalance = async () => {
    await usdt.mint(buyer.address, (ONE_TOKEN * 10).toString());
    await sqnk.transfer(buyer.address, (ONE_TOKEN * 10).toString());
  }

  addInitialLiquidities = async () => {
    const amountToAdd = (ONE_TOKEN * 5).toString();

    await sqnk.approve(router.address, (amountToAdd * 10).toString());
    await usdt.approve(router.address, (amountToAdd * 10).toString());
    await usdc.approve(router.address, (amountToAdd * 10).toString());
    await dao.approve(router.address, (amountToAdd * 10).toString());

    await sqnk.setTaxEnabled(false);

    await router.addLiquidityETH(
      sqnk.address,
      amountToAdd,
      0,
      ethers.utils.parseEther("0.1"),
      owner.address,
      Math.round((Date.now() + 86400 * 2) / 1000),
      { value: ethers.utils.parseEther("1.0") }
    );

    await sqnk.approve(router.address, amountToAdd);

    await router.addLiquidityETH(
      usdt.address,
      amountToAdd,
      0,
      ethers.utils.parseEther("0.1"),
      owner.address,
      Math.round((Date.now() + 86400 * 2) / 1000),
      { value: ethers.utils.parseEther("1.0") }
    );

    await router.addLiquidityETH(
      usdc.address,
      amountToAdd,
      0,
      ethers.utils.parseEther("0.1"),
      owner.address,
      Math.round((Date.now() + 86400 * 2) / 1000),
      { value: ethers.utils.parseEther("1.0") }
    );

    await router.addLiquidityETH(
      dao.address,
      amountToAdd,
      0,
      ethers.utils.parseEther("0.1"),
      owner.address,
      Math.round((Date.now() + 86400 * 2) / 1000),
      { value: ethers.utils.parseEther("1.0") }
    );

    await sqnk.setTaxEnabled(true);
  }

  function checkTaxes(balanceBeforeBn, balanceAfterBn, tax, amountOutBn) {
    const taxBn = tax ? getBn(tax) : null;
    expect(balanceAfterBn).to.equal(balanceBeforeBn.plus(tax ? amountOutBn.multipliedBy(taxBn).toFixed(0) : 0));
  }

  function consoleGroup(name, callback) {
    console.group(name);
    callback();
    console.groupEnd();
  }

  function getBn(response) {
    const responseBn = new BigNumber(response.toString());
    return responseBn;
  }

  function logBeforeAfter(name, before, after) {
    console.log(
      `BEFORE ${name}:`, before.dividedBy(getBn(ONE_TOKEN)).toNumber(),
      `AFTER ${name}:`, after.dividedBy(getBn(ONE_TOKEN)).toNumber()
    );
  }

  async function compareBalances(callback) {
    const sqnkBalanceBefore = getBn(await sqnk.balanceOf(buyer.address));
    const ethBalanceBefore = await ethers.provider.getBalance(buyer.address);
    const marketingWalletBalanceBefore = getBn(await sqnk.balanceOf(marketingWallet.address));
    const rewardWalletBalanceBefore = getBn(await sqnk.balanceOf(rewardWallet.address));

    const tx = await callback();
    const gasUsed = await estimateGas(tx);

    const sqnkBalanceAfter = getBn(await sqnk.balanceOf(buyer.address));
    const ethBalanceAfter = await ethers.provider.getBalance(buyer.address);
    const marketingWalletBalanceAfter = getBn(await sqnk.balanceOf(marketingWallet.address));
    const rewardWalletBalanceAfter = getBn(await sqnk.balanceOf(rewardWallet.address));

    return {
      sqnkBalanceBefore,
      sqnkBalanceAfter,
      ethBalanceBefore,
      ethBalanceAfter,
      marketingWalletBalanceBefore,
      marketingWalletBalanceAfter,
      rewardWalletBalanceBefore,
      rewardWalletBalanceAfter,
      gasUsed
    }
  }

  async function estimateGas(tx) {
    const txReceipt = await tx.wait();
    return ethers.BigNumber.from(txReceipt.gasUsed * txReceipt.effectiveGasPrice);
  }

  async function getSqnkReward() {
    const userSqnkBalance = getBn(await sqnk.balanceOf(buyer.address));
    const totalSupply = getBn(await sqnk.totalSupply());
    const rewardBalanceSqnkBefore = getBn(await sqnk.balanceOf(rewardWallet.address));

    const rewardPercentage = userSqnkBalance.multipliedBy(getBn(100 * (10 ** 18))).dividedBy(totalSupply);
    const userReward = rewardBalanceSqnkBefore.multipliedBy(rewardPercentage).dividedBy(getBn(100)).dividedBy(getBn(10 ** 18));
    return userReward;
  }

  async function buyExactSqnk(logs = true) {
    const amountsOut = await router.getAmountsOut(ONE_TOKEN, [weth.address, sqnk.address]);
    const buyerIsExcludedFromTaxes = await sqnk.getExcludedFromTax(buyer.address);
    const amountOut = getBn(amountsOut[1]);
    
    const {
      sqnkBalanceBefore,
      sqnkBalanceAfter,
      ethBalanceBefore,
      ethBalanceAfter,
      marketingWalletBalanceBefore,
      marketingWalletBalanceAfter,
      rewardWalletBalanceBefore,
      rewardWalletBalanceAfter,
      gasUsed
    } = await compareBalances(async () => {
      return await router.connect(buyer).swapExactETHForTokens(
        amountsOut[0],
        [weth.address, sqnk.address],
        buyer.address,
        Math.round((Date.now() + 86400 * 2) / 1000),
        { value: ethers.utils.parseEther("1.0") }
      );
    });

    if (!buyerIsExcludedFromTaxes) {
      const userReward = await getSqnkReward();
      const rewards = await sqnet.connect(buyer).getAvailableUsdtRewards(userReward.toFixed(0));
    }

    if (logs) {
      consoleGroup('BUY SQNK', () => {
        logBeforeAfter('SQNK', sqnkBalanceBefore, sqnkBalanceAfter);
        logBeforeAfter('ETH', getBn(ethBalanceBefore), getBn(ethBalanceAfter));
        logBeforeAfter('MARKETING', marketingWalletBalanceBefore, marketingWalletBalanceAfter);
        logBeforeAfter('REWARD', rewardWalletBalanceBefore, rewardWalletBalanceAfter);
      });
    }

    checkTaxes(marketingWalletBalanceBefore, marketingWalletBalanceAfter, !buyerIsExcludedFromTaxes && (MARKETING_TAX + LIQUIDITY_TAX), amountOut);
    checkTaxes(rewardWalletBalanceBefore, rewardWalletBalanceAfter, !buyerIsExcludedFromTaxes && REWARD_TAX, amountOut);
    // expect(ethBalanceAfter / 10 ** 18).to.equal((+ethBalanceBefore - +ethers.utils.parseEther("1.0") - +gasUsed) / 10 ** 18);
    expect(sqnkBalanceAfter).to
                            .equal(sqnkBalanceBefore.plus(buyerIsExcludedFromTaxes ? amountOut : amountOut.minus(amountOut.multipliedBy(getBn(OVERALL_TAX)).toFixed(0))));
  }

  async function sellExactSqnk() {
    await sqnk.connect(buyer).approve(router.address, ONE_TOKEN);
    const buyerIsExcludedFromTaxes = await sqnk.getExcludedFromTax(buyer.address);
    const amountIn = ONE_TOKEN - (buyerIsExcludedFromTaxes ? 0 : (ONE_TOKEN * (OVERALL_TAX)));
    const [_, ethOut] = await router.getAmountsOut(amountIn.toString(), [sqnk.address, weth.address]);

    const {
      sqnkBalanceBefore,
      sqnkBalanceAfter,
      ethBalanceBefore,
      ethBalanceAfter,
      marketingWalletBalanceBefore,
      marketingWalletBalanceAfter,
      rewardWalletBalanceBefore,
      rewardWalletBalanceAfter,
      gasUsed
    } = await compareBalances(async () => {
      return router.connect(buyer).swapExactTokensForETHSupportingFeeOnTransferTokens(
        ONE_TOKEN,
        ethOut,
        [sqnk.address, weth.address],
        buyer.address,
        Math.round((Date.now() + 86400 * 2) / 1000)
      );
    });

    consoleGroup('SELL SQNK', () => {
      logBeforeAfter('SQNK', sqnkBalanceBefore, sqnkBalanceAfter);
      logBeforeAfter('ETH', getBn(ethBalanceBefore), getBn(ethBalanceAfter));
      logBeforeAfter('MARKETING', marketingWalletBalanceBefore, marketingWalletBalanceAfter);
      logBeforeAfter('REWARD', rewardWalletBalanceBefore, rewardWalletBalanceAfter);
    });

    checkTaxes(marketingWalletBalanceBefore, marketingWalletBalanceAfter, !buyerIsExcludedFromTaxes && (MARKETING_TAX + LIQUIDITY_TAX), getBn(ONE_TOKEN));
    checkTaxes(rewardWalletBalanceBefore, rewardWalletBalanceAfter, !buyerIsExcludedFromTaxes && REWARD_TAX, getBn(ONE_TOKEN));

    expect(ethBalanceAfter / ONE_TOKEN).to.equal((+ethBalanceBefore + +ethOut - +gasUsed) / ONE_TOKEN);
    expect(sqnkBalanceAfter).to.equal(sqnkBalanceBefore.minus(getBn(ONE_TOKEN)));
  }

  it('Buy and sell Exact SQNK', async () => {
    await buyExactSqnk();
    await sellExactSqnk();
  });

  it('Buy and sell Exact SQNK with excluded from taxes', async () => {
    await sqnk.setExcludedFromTax(buyer.address, true);
    await buyExactSqnk();
    await sellExactSqnk();
  });
});
