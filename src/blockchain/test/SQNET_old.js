// /* eslint-disable prettier/prettier */
// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { it } = require("mocha");
// const PairABI = require("../artifacts/contracts/core/UniswapV2Pair.sol/UniswapV2Pair.json").abi;

// describe("SQNET_old", function () {
//   let factory;
//   let sqt;
//   let usdt;
//   let router;
//   let weth;
//   let pair;
//   let sqnet;
//   const ONE_TOKEN = (10 ** 18).toString();
//   const MARKETING_TAX = 0.03;
//   const LIQUIDITY_TAX = 0.01;
//   const REWARD_TAX = 0.06;

//   beforeEach(async () => {
//     [owner, account1, buyer, rewardWallet, marketingWallet] = await ethers.getSigners();
//     await createPair();
//     await deployRouter();
//     await deploySqnet();
//     await mintBalance();
//     await addInitialLiquidity();
//   });

//   createPair = async () => {
//     const Factory = await ethers.getContractFactory("UniswapV2Factory");
//     factory = await Factory.deploy(owner.address);
//     await factory.deployed();

//     const SQT = await ethers.getContractFactory("SQT");
//     sqt = await SQT.deploy(marketingWallet.address, rewardWallet.address);
//     await sqt.deployed();

//     const USDT = await ethers.getContractFactory("USDT");
//     usdt = await USDT.deploy();
//     await usdt.deployed();

//     await factory.createPair(sqt.address, usdt.address);
//     const pairAddress = await factory.getPairAddress(sqt.address, usdt.address);
//     pair = await ethers.getContractAt(PairABI, pairAddress);
//   }

//   deployRouter = async () => {
//     const WETH = await ethers.getContractFactory("WETH");
//     weth = await WETH.deploy();
//     await weth.deployed();

//     const Router = await ethers.getContractFactory("UniswapV2Router02");
//     router = await Router.deploy(factory.address, weth.address);
//     await router.deployed();
//   }

//   deploySqnet = async () => {
//     const SQNET = await ethers.getContractFactory("SQNET");
//     sqnet = await SQNET.deploy(router.address, sqt.address, factory.address, rewardWallet.address, marketingWallet.address);
//     await sqnet.deployed();

//     sqt.setSqnetAddress(sqnet.address);
//   }

//   mintBalance = async () => {
//     await sqt.mint(owner.address, (ONE_TOKEN * 10).toString());
//     await usdt.mint(owner.address, (ONE_TOKEN * 10).toString());
//     await usdt.mint(buyer.address, (ONE_TOKEN * 10).toString());
//     await sqt.mint(buyer.address, (ONE_TOKEN * 10).toString());
//   }

//   addInitialLiquidity = async () => {
//     const amountToAdd = (ONE_TOKEN * 5).toString();

//     await sqt.approve(sqnet.address, amountToAdd);
//     await usdt.approve(sqnet.address, amountToAdd);

//     await sqnet.addLiquidity(
//       sqt.address,
//       usdt.address,
//       amountToAdd,
//       amountToAdd,
//       amountToAdd,
//       amountToAdd,
//       owner.address,
//       Math.round((Date.now() + 86400 * 2) / 1000)
//     );
//   }

//   function checkTaxes (balanceBefore, balanceAfter, tax) {
//     if (balanceBefore > 0) {
//       expect(balanceAfter).to.equal(balanceBefore + (balanceBefore * tax));
//     } else {
//       expect(balanceAfter).to.equal(tax);
//     }
//   }

//   async function getAmountOut (amountIn) {
//     const [reserveIn, reserveOut] = await pair.getReserves();
//     const amountInWithFee = amountIn * 997;
//     const numerator = amountInWithFee * reserveOut.toString();
//     const denominator = reserveIn.toString() * 1000 + amountInWithFee;
//     return numerator / denominator;
//   }

//   // given an output amount of an asset and pair reserves, returns a required input amount of the other asset
//   async function getAmountIn (amountOut) {
//     const [reserveIn, reserveOut] = await pair.getReserves();
//     const numerator = reserveIn.toString() * amountOut.toString() * 1000;
//     const denominator = reserveOut.toString() - (amountOut.toString() * 997);
//     return (numerator.toString() / denominator.toString()) + 1;
//   }

//   it("Buy exact SQT for USDT", async () => {
//     await usdt.connect(buyer).approve(sqnet.address, ONE_TOKEN);
//     const sqtBalanceBefore = await sqt.balanceOf(buyer.address) / ONE_TOKEN;
//     const usdtBalanceBefore = await usdt.balanceOf(buyer.address) / ONE_TOKEN;
//     const marketingWalletBalanceBefore = await usdt.balanceOf(marketingWallet.address) / ONE_TOKEN;
//     const rewardWalletBalanceBefore = await usdt.balanceOf(rewardWallet.address) / ONE_TOKEN;
//     const pairUsdtBalanceBefore = await usdt.balanceOf(pair.address) / ONE_TOKEN;

//     const amountOut = await getAmountOut((ONE_TOKEN - ONE_TOKEN * 0.1));

//     await sqnet.connect(buyer).swapExactTokensForTokens(
//       ONE_TOKEN, 
//       0,
//       [usdt.address, sqt.address],
//       buyer.address, 
//       Math.round((Date.now() + 86400 * 2) / 1000)
//     );

//     const sqtBalanceAfter = await sqt.balanceOf(buyer.address) / ONE_TOKEN;
//     const usdtBalanceAfter = await usdt.balanceOf(buyer.address) / ONE_TOKEN;
//     const marketingWalletBalanceAfter = await usdt.balanceOf(marketingWallet.address) / ONE_TOKEN;
//     const rewardWalletBalanceAfter = await usdt.balanceOf(rewardWallet.address) / ONE_TOKEN;
//     const pairUsdtBalanceAfter = await usdt.balanceOf(pair.address) / ONE_TOKEN;

//     checkTaxes(marketingWalletBalanceBefore, marketingWalletBalanceAfter, MARKETING_TAX);
//     checkTaxes(rewardWalletBalanceBefore, rewardWalletBalanceAfter, REWARD_TAX);

//     const oneCoin = ONE_TOKEN / ONE_TOKEN;
//     expect(pairUsdtBalanceAfter).to.equal(pairUsdtBalanceBefore + (oneCoin - oneCoin * 0.1) + oneCoin * LIQUIDITY_TAX);
//     expect(usdtBalanceAfter).to.equal(usdtBalanceBefore - (ONE_TOKEN / ONE_TOKEN));
//     expect(sqtBalanceAfter).to.equal(sqtBalanceBefore + amountOut / ONE_TOKEN);
//   });

//   it("Buy SQT for exact USDT", async () => {
//     // await usdt.connect(buyer).approve(sqnet.address, ONE_TOKEN);

//     // const usdtToSpend = (ONE_TOKEN * 1.4).toString();
//     // const sqtBalanceBefore = await sqt.balanceOf(buyer.address) / ONE_TOKEN;
//     // const usdtBalanceBefore = await usdt.balanceOf(buyer.address) / ONE_TOKEN;
//     // const marketingWalletBalanceBefore = await usdt.balanceOf(marketingWallet.address) / ONE_TOKEN;
//     // const rewardWalletBalanceBefore = await usdt.balanceOf(rewardWallet.address) / ONE_TOKEN;
//     // const pairUsdtBalanceBefore = await usdt.balanceOf(pair.address) / ONE_TOKEN;

//     // const amountIn = await sqnet.getAmountsIn(usdtToSpend, [usdt.address, sqt.address]);
//     // console.log(amountIn);
//     // await sqnet.connect(buyer).swapTokensForExactTokens(
//     //   usdtToSpend, 
//     //   amountIn,
//     //   [usdt.address, sqt.address],
//     //   buyer.address, 
//     //   Math.round((Date.now() + 86400 * 2) / 1000)
//     // );

//     // const sqtBalanceAfter = await sqt.balanceOf(buyer.address) / ONE_TOKEN;
//     // const usdtBalanceAfter = await usdt.balanceOf(buyer.address) / ONE_TOKEN;
//     // const marketingWalletBalanceAfter = await usdt.balanceOf(marketingWallet.address) / ONE_TOKEN;
//     // const rewardWalletBalanceAfter = await usdt.balanceOf(rewardWallet.address) / ONE_TOKEN;
//     // const pairUsdtBalanceAfter = await usdt.balanceOf(pair.address) / ONE_TOKEN;

//     // checkTaxes(marketingWalletBalanceBefore, marketingWalletBalanceAfter, MARKETING_TAX);
//     // checkTaxes(rewardWalletBalanceBefore, rewardWalletBalanceAfter, REWARD_TAX);

//     // const oneCoin = ONE_TOKEN / ONE_TOKEN;
//     // expect(pairUsdtBalanceAfter).to.equal(pairUsdtBalanceBefore + (oneCoin - oneCoin * 0.1) + oneCoin * LIQUIDITY_TAX);
//     // expect(usdtBalanceAfter).to.equal(usdtBalanceBefore - (ONE_TOKEN / ONE_TOKEN));
//     // expect(sqtBalanceAfter).to.equal(sqtBalanceBefore + amountOut / ONE_TOKEN);
//   });
// });
