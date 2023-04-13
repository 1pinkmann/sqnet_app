import { observable, action } from 'mobx';
import { SQNK_ADDRESS, SQNET_ADDRESS } from '../../constants';
import Web3Store from './Web3Store';

import sqnkAbi from './../../blockchain/artifacts/contracts/SQNK.sol/SQNK.json';
import sqnetAbi from './../../blockchain/artifacts/contracts/SQNET.sol/SQNET.json';
import getBn from '../../services/getBn';
import { makeObservable } from 'mobx';

export default class ContractsStore extends Web3Store {
  @observable SqnkContract;
  @observable SqnetContract;

  constructor () {
    super();
    makeObservable(this);
  }

  fetchBalance = async (address) => {
    const balance = await this.SqnkContract.methods.balanceOf(address).call();
    return balance;
  }

  fetchLastClaim = async (address) => {
    const lastClaimResponse = await this.SqnetContract.methods.getLastClaim(address).call();
    return lastClaimResponse;
  }

  getSqnkReward = async (address) => {
    const rewardWallet = await this.SqnkContract.methods.rewardWallet().call();
    const userSqnkBalance = getBn(await this.SqnkContract.methods.balanceOf(address).call());
    const totalSupply = getBn(await this.SqnkContract.methods.totalSupply().call());
    const rewardBalanceSqnkBefore = getBn(await this.SqnkContract.methods.balanceOf(rewardWallet).call());

    const rewardPercentage = userSqnkBalance.multipliedBy(getBn(100 * (10 ** 18))).dividedBy(totalSupply);
    const userReward = rewardBalanceSqnkBefore.multipliedBy(rewardPercentage).dividedBy(getBn(100)).dividedBy(getBn(10 ** 18));
    return userReward;
  }

  claimRewards = async (address, token0, token1, callback) => {
    return this.SqnetContract.methods.claimRewards(token0, token1).send({ from: address }).on('confirmation', () => {
      if (callback) callback();
    });
  }

  fetchAvailableRewards = async (address) => {
    const sqnkRewards = await this.getSqnkReward(address);
    let usdtRewards;

    if (sqnkRewards >= 1) {
      usdtRewards = await this.SqnetContract.methods.getAvailableUsdtRewards(sqnkRewards.toFixed(0)).call({ from: address });
    } else {
      usdtRewards = 0;
    }

    return usdtRewards / 10 ** 18;
  }

  @action setSqnkContract = (web3) => {
    this.SqnkContract = new web3.eth.Contract(sqnkAbi.abi, SQNK_ADDRESS);
  }

  @action setSqnetContract = (web3) => {
    this.SqnetContract = new web3.eth.Contract(sqnetAbi.abi, SQNET_ADDRESS);
  }
}
