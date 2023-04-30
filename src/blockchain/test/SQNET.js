/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
const { default: BigNumber } = require("bignumber.js");
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { it } = require("mocha");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const PairABI = require("../artifacts/contracts/core/UniswapV2Pair.sol/UniswapV2Pair.json").abi;

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });
const oneDay = 1 * 24 * 60 * 60;

async function nextBlock() {
  return await network.provider.send("hardhat_mine", ["0x100"]);
}

describe("SQNET", function () {
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

    sqnk = await SQNK.deploy('SQNK', 'SQNK', marketingWallet.address, rewardWallet.address, owner.address);
    await sqnk.deployed();

    // Estimate gas cost for deployment
    const { effectiveGasPrice, gasUsed } = await sqnk.deployTransaction.wait();
    const cost = ethers.utils.formatEther(gasUsed.mul(effectiveGasPrice));
    console.log(`Estimated deployment cost: ${cost} ETH`);

    await factory.createPair(sqnk.address, weth.address);
    const pairAddress = await factory.getPairAddress(sqnk.address, weth.address);
    pair = await ethers.getContractAt(PairABI, pairAddress);

    // console.log(await factory.pairCodeHash());
  }

  deploySqnet = async () => {
    const SQNET = await ethers.getContractFactory("SQNET");
    sqnet = await SQNET.deploy(router.address, sqnk.address, usdt.address);
    const tx = await sqnet.deployed();

    console.log('tx', tx);

    // Estimate gas cost for deployment
    const { effectiveGasPrice, gasUsed } = await sqnet.deployTransaction.wait();
    const cost = ethers.utils.formatEther(gasUsed.mul(effectiveGasPrice));
    console.log(`Estimated deployment cost SQNET: ${cost} ETH`);

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
    const taxBn = getBn(tax);
    expect(balanceAfterBn).to.equal(balanceBeforeBn.plus(amountOutBn.multipliedBy(taxBn).toFixed(0)));
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

  async function buyExactSqnk(logs = true) {
    const amountsOut = await router.getAmountsOut(ONE_TOKEN, [weth.address, sqnk.address]);
    const amountOut = getBn(amountsOut[1])

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
      return router.connect(buyer).swapExactETHForTokens(
        amountsOut[0],
        [weth.address, sqnk.address],
        buyer.address,
        Math.round((Date.now() + 86400 * 2) / 1000),
        { value: ethers.utils.parseEther("1.0") }
      );
    });
    const userReward = await getSqnkReward();
    const rewards = await sqnet.connect(buyer).getAvailableUsdtRewards(userReward.toFixed(0));

    if (logs) {
      consoleGroup('BUY SQNK', () => {
        logBeforeAfter('SQNK', sqnkBalanceBefore, sqnkBalanceAfter);
        logBeforeAfter('ETH', getBn(ethBalanceBefore), getBn(ethBalanceAfter));
        logBeforeAfter('MARKETING', marketingWalletBalanceBefore, marketingWalletBalanceAfter);
        logBeforeAfter('REWARD', rewardWalletBalanceBefore, rewardWalletBalanceAfter);
      });
    }

    checkTaxes(marketingWalletBalanceBefore, marketingWalletBalanceAfter, (MARKETING_TAX + LIQUIDITY_TAX), amountOut);
    checkTaxes(rewardWalletBalanceBefore, rewardWalletBalanceAfter, REWARD_TAX, amountOut);
    // expect(ethBalanceAfter / 10 ** 18).to.equal((+ethBalanceBefore - +ethers.utils.parseEther("1.0") - +gasUsed) / 10 ** 18);
    expect(sqnkBalanceAfter).to.equal(sqnkBalanceBefore.plus(amountOut.minus(amountOut.multipliedBy(getBn(OVERALL_TAX)).toFixed(0))));
  }

  async function sellExactSqnk() {
    await sqnk.connect(buyer).approve(router.address, ONE_TOKEN);
    const amountIn = ONE_TOKEN - (ONE_TOKEN * (OVERALL_TAX));
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

    checkTaxes(marketingWalletBalanceBefore, marketingWalletBalanceAfter, MARKETING_TAX + LIQUIDITY_TAX, getBn(ONE_TOKEN));
    checkTaxes(rewardWalletBalanceBefore, rewardWalletBalanceAfter, REWARD_TAX, getBn(ONE_TOKEN));

    expect(ethBalanceAfter / ONE_TOKEN).to.equal((+ethBalanceBefore + +ethOut - +gasUsed) / ONE_TOKEN);
    expect(sqnkBalanceAfter).to.equal(sqnkBalanceBefore.minus(getBn(ONE_TOKEN)));
  }

  async function getSqnkReward() {
    const userSqnkBalance = getBn(await sqnk.balanceOf(buyer.address));
    const totalSupply = getBn(await sqnk.totalSupply());
    const rewardBalanceSqnkBefore = getBn(await sqnk.balanceOf(rewardWallet.address));

    const rewardPercentage = userSqnkBalance.multipliedBy(getBn(100 * (10 ** 18))).dividedBy(totalSupply);
    const userReward = rewardBalanceSqnkBefore.multipliedBy(rewardPercentage).dividedBy(getBn(100)).dividedBy(getBn(10 ** 18));
    return userReward;
  }

  async function convertTaxIntoEth() {
    const userReward = await getSqnkReward();
    const amountsOut = await router.getAmountsOut(userReward.toFixed(0), [sqnk.address, weth.address]);
    return amountsOut[1];
  }

  // async function buySqnkForExactEth () {
  //   const amounts = await router.getAmountsIn(ONE_TOKEN, [weth.address, sqnk.address]);
  //   const amountIn = getBn(amounts[0]);
  //   const oneTokenBn = getBn(ONE_TOKEN);

  //   const {
  //     sqnkBalanceBefore,
  //     sqnkBalanceAfter,
  //     usdtBalanceBefore,
  //     usdtBalanceAfter,
  //     marketingWalletBalanceBefore,
  //     marketingWalletBalanceAfter,
  //     rewardWalletBalanceBefore,
  //     rewardWalletBalanceAfter
  //   } = await compareBalances(async () => {
  //     await router.connect(buyer).swapTokensForExactETH(
  //       ethers.utils.parseEther('1.0'), 
  //       amountIn.toString(),
  //       [usdt.address, sqnk.address],
  //       buyer.address, 
  //       Math.round((Date.now() + 86400 * 2) / 1000),
  //       { value: ethers.utils.parseEther('1.0') }
  //     );
  //   });

  //   consoleGroup('BUY SQNK FOR EXACT USDT', () => {
  //     logBeforeAfter('SQNK', sqnkBalanceBefore, sqnkBalanceAfter);
  //     logBeforeAfter('USDT', usdtBalanceBefore, usdtBalanceAfter);
  //     logBeforeAfter('MARKETING', marketingWalletBalanceBefore, marketingWalletBalanceAfter);
  //     logBeforeAfter('REWARD', rewardWalletBalanceBefore, rewardWalletBalanceAfter);
  //   });

  //   checkTaxes(marketingWalletBalanceBefore, marketingWalletBalanceAfter, MARKETING_TAX + LIQUIDITY_TAX, getBn(amounts[1]));
  //   checkTaxes(rewardWalletBalanceBefore, rewardWalletBalanceAfter, REWARD_TAX, getBn(amounts[1]));

  //   expect(usdtBalanceAfter).to.equal(usdtBalanceBefore.minus(getBn(amountIn)));
  //   expect(sqnkBalanceAfter).to.equal(sqnkBalanceBefore.plus(oneTokenBn.minus(oneTokenBn.multipliedBy(getBn(OVERALL_TAX)))));
  // }

  it("Buy/Sell exact SQNK for ETH", async () => {
    await buyExactSqnk();
    await sellExactSqnk();
  });

  // // it("Buy SQNK for exact ETH", async () => {
  // //   await buySqnkForExactEth();
  // // });

  it("Buy exact SQNK and convert tax", async () => {
    await buyExactSqnk(false);

    const marketingSqnkBefore = getBn(await sqnk.balanceOf(marketingWallet.address));
    const marketingEthBefore = await ethers.provider.getBalance(marketingWallet.address);
    const pairEthBefore = getBn(await weth.balanceOf(pair.address));
    const pairSqnkBefore = getBn(await sqnk.balanceOf(pair.address));

    const liquidityAmountSqnk = getBn(marketingSqnkBefore.multipliedBy(getBn(LIQUIDITY_TAX)).toFixed(0));
    const marketingAmountSqnk = marketingSqnkBefore.minus(liquidityAmountSqnk);

    const marketingAmountsOut = await router.getAmountsOut(marketingAmountSqnk.toString(), [sqnk.address, weth.address]);
    // const liquidityAmountsOut = await router.getAmountsOut(liquidityAmountSqnk.dividedBy(2).toFixed(0), [sqnk.address, weth.address]);

    await sqnet.swapMarketingTaxesForETH();

    const marketingSqnkAfter = getBn(await sqnk.balanceOf(marketingWallet.address));
    const marketingEthtAfter = await ethers.provider.getBalance(marketingWallet.address);
    const pairEthAfter = getBn(await weth.balanceOf(pair.address));
    const pairSqnkAfter = getBn(await sqnk.balanceOf(pair.address));

    consoleGroup('Convert tax into USDT', () => {
      logBeforeAfter('SQNK', marketingSqnkBefore, marketingSqnkAfter);
      logBeforeAfter('ETH', getBn(marketingEthBefore), getBn(marketingEthtAfter));
      logBeforeAfter('PAIR SQNK', pairSqnkBefore, pairSqnkAfter);
      logBeforeAfter('PAIR ETH', pairEthBefore, pairEthAfter);
    });

    expect(marketingSqnkAfter).to.equal(marketingSqnkBefore.minus(marketingSqnkBefore));
    expect(marketingEthtAfter / ONE_TOKEN).to.equal((+marketingEthBefore + +marketingAmountsOut[1]) / ONE_TOKEN);
    // expect(pairEthAfter).to.equal(pairEthBefore.minus(getBn(marketingAmountsOut[1])).minus(getBn(liquidityAmountsOut[1])));
  });

  it("Claim rewards: ETH/ETH while excluded from rewards", async () => {
    // await sqnet.setExcludedFromRewards(buyer.address, true);
    // const buyerIsExcludedFromRewards = await sqnet.getExcludedFromRewards(buyer.address);
    const rewardTokens = [weth.address, weth.address];
    await buyExactSqnk();

    const ethBalanceBefore = await ethers.provider.getBalance(buyer.address);
    const ethOut = await convertTaxIntoEth();

    const tx = await sqnet.connect(buyer).claimRewards(rewardTokens[0], rewardTokens[1]);
    const gasUsed = await estimateGas(tx);

    const ethBalanceAfter = await ethers.provider.getBalance(buyer.address);

    consoleGroup('GET ETH', () => {
      logBeforeAfter('ETH', getBn(ethBalanceBefore), getBn(ethBalanceAfter));
    });

    // await time.increase(oneDay);
    // await sqnet.connect(buyer).claimRewards(rewardTokens[0], rewardTokens[1]);

    expect((ethBalanceAfter / ONE_TOKEN).toFixed(11).toString()).to.equal(((+ethBalanceBefore + +ethOut - +gasUsed) / ONE_TOKEN).toFixed(11).toString());
  });

  it("Claim rewards: DAO/USDT", async () => {
    const rewardTokens = [dao.address, usdt.address];
    await buyExactSqnk();

    const usdtBalanceBefore = getBn(await usdt.balanceOf(buyer.address));
    const daoBalanceBefore = getBn(await dao.balanceOf(buyer.address));
    const ethOut = await convertTaxIntoEth();

    const daoAmountsOut = await router.getAmountsOut(getBn(ethOut).dividedBy(2).toFixed(0).toString(), [weth.address, rewardTokens[0]]);
    const usdtAmountsOut = await router.getAmountsOut(getBn(ethOut).dividedBy(2).toFixed(0).toString(), [weth.address, rewardTokens[1]]);

    await sqnet.connect(buyer).claimRewards(rewardTokens[0], rewardTokens[1]);

    const usdtBalanceAfter = getBn(await usdt.balanceOf(buyer.address));
    const daoBalanceAfter = getBn(await dao.balanceOf(buyer.address));
    // // await time.increase(oneDay);
    // // await sqnet.connect(buyer).claimRewards(usdc.address, dao.address);

    expect(usdtBalanceAfter).to.equal(usdtBalanceBefore.plus(getBn(usdtAmountsOut[1])));
    expect(daoBalanceAfter).to.equal(daoBalanceBefore.plus(getBn(daoAmountsOut[1])));
  });

  // it("Claim rewards: DAO/USDC", async () => {
  //   const rewardTokens = [dao.address, usdc.address];
  //   await buyExactSqnk();

  //   const daoBalanceBefore = getBn(await dao.balanceOf(buyer.address));
  //   const usdcBalanceBefore = getBn(await usdc.balanceOf(buyer.address));
  //   const usdtOut = await convertTaxIntoEth();

  //   const daoOut = await router.getAmountsOut((usdtOut / 2).toString(), [usdt.address, rewardTokens[0]]);
  //   const usdcOut = await router.getAmountsOut((usdtOut / 2).toString(), [usdt.address, rewardTokens[1]]);

  //   await sqnet.connect(buyer).claimRewards(rewardTokens[0], rewardTokens[1]);

  //   const daoBalanceAfter = getBn(await dao.balanceOf(buyer.address));
  //   const usdcBalanceAfter = getBn(await usdc.balanceOf(buyer.address));
  //   // // await time.increase(oneDay);
  //   // // await sqnet.connect(buyer).claimRewards(usdc.address, dao.address);

  //   expect(daoBalanceAfter).to.equal(daoBalanceBefore.plus(getBn(daoOut[1])));
  //   expect(usdcBalanceAfter).to.equal(usdcBalanceBefore.plus(getBn(usdcOut[1])));
  // });

  it("Remove liquidity ETH", async () => {
    await buyExactSqnk();
    const liquidity = await pair.balanceOf(owner.address);
    await pair.approve(sqnet.address, liquidity);
    await sqnet.removeLiquidityETH(pair.address, liquidity.toString(), ONE_TOKEN, ONE_TOKEN, owner.address);
  });

  it("Remove liquidity USDT", async () => {
    const amountToAdd = ONE_TOKEN;
    sqnk.connect(buyer).approve(router.address, amountToAdd);
    usdt.connect(buyer).approve(router.address, amountToAdd);
    await router.connect(buyer).addLiquidity(
      sqnk.address,
      usdt.address,
      amountToAdd,
      amountToAdd,
      amountToAdd,
      amountToAdd,
      buyer.address,
      Math.round((Date.now() + 86400 * 2) / 1000)
    );
    const pairAddress = await factory.getPairAddress(sqnk.address, usdt.address);
    const pair = await ethers.getContractAt(PairABI, pairAddress);
    const liquidity = await pair.balanceOf(buyer.address);
    await pair.connect(buyer).approve(router.address, liquidity);
    await router.connect(buyer).removeLiquidity(sqnk.address, usdt.address, liquidity.toString(), (amountToAdd / 2).toString(), (amountToAdd / 2).toString(), buyer.address, Math.round((Date.now() + 86400 * 2) / 1000));
  });
});
