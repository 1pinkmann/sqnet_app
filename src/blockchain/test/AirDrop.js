/* eslint-disable no-undef */
const { default: BigNumber } = require("bignumber.js");
const { expect } = require("chai");
const { ethers } = require("hardhat");

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });

describe("AirDrop", function () {
  let sqnk, airDrop;

  beforeEach(async () => {
    [owner, receiver1, receiver2, receiver3, receiver4, marketingWallet, rewardWallet] = await ethers.getSigners();
    const SQNK = await ethers.getContractFactory("SQNK");

    sqnk = await SQNK.deploy('Squid Network', 'SQNK', marketingWallet.address, rewardWallet.address, owner.address);
    await sqnk.deployed();

    const AirDrop = await ethers.getContractFactory("AirDrop");
    airDrop = await AirDrop.deploy(sqnk.address);
    await airDrop.deployed();
  });

  async function estimateGas(tx) {
    const txReceipt = await tx.wait();
    console.log('txReceipt', txReceipt);
    return ethers.BigNumber.from(txReceipt.gasUsed); // * txReceipt.effectiveGasPrice
  }

  function getBn(response) {
    const responseBn = new BigNumber(response.toString());
    return responseBn;
  }

  async function compareBalances(callback) {
    const receiver1BalanceBefore = getBn(await sqnk.balanceOf(receiver1.address));
    const receiver2BalanceBefore = getBn(await sqnk.balanceOf(receiver2.address));
    const receiver3BalanceBefore = getBn(await sqnk.balanceOf(receiver3.address));
    const receiver4BalanceBefore = getBn(await sqnk.balanceOf(receiver4.address));

    const tx = await callback();
    const gasUsed = await estimateGas(tx);
    console.log('gasUsed', gasUsed);
    const receiver1BalanceAfter = getBn(await sqnk.balanceOf(receiver1.address));
    const receiver2BalanceAfter = getBn(await sqnk.balanceOf(receiver2.address));
    const receiver3BalanceAfter = getBn(await sqnk.balanceOf(receiver3.address));
    const receiver4BalanceAfter = getBn(await sqnk.balanceOf(receiver4.address));

    return {
      gasUsed,
      receiver1BalanceBefore,
      receiver2BalanceBefore,
      receiver3BalanceBefore,
      receiver4BalanceBefore,
      receiver1BalanceAfter,
      receiver2BalanceAfter,
      receiver3BalanceAfter,
      receiver4BalanceAfter
    }
  }

  it('Initiate drop', async () => {
    const recipients = [receiver1.address, receiver2.address, receiver3.address, receiver4.address];
    const value = (10 ** 18).toString();
    const amounts = [value, value, value, value];
    const amount = amounts.reduce((result, item) => getBn(item).plus(getBn(result)), 0);

    await sqnk.approve(airDrop.address, amount.toString());
    
    const {
      receiver1BalanceBefore,
      receiver2BalanceBefore,
      receiver3BalanceBefore,
      receiver4BalanceBefore,
      receiver1BalanceAfter,
      receiver2BalanceAfter,
      receiver3BalanceAfter,
      receiver4BalanceAfter
    } = await compareBalances(async () => {
      return airDrop.sendBatch(recipients, amounts);
    });

    expect(receiver1BalanceAfter).to.equal(getBn(receiver1BalanceBefore).plus(getBn(value)));
    expect(receiver2BalanceAfter).to.equal(getBn(receiver2BalanceBefore).plus(getBn(value)));
    expect(receiver3BalanceAfter).to.equal(getBn(receiver3BalanceBefore).plus(getBn(value)));
    expect(receiver4BalanceAfter).to.equal(getBn(receiver4BalanceBefore).plus(getBn(value)));
  });
});
