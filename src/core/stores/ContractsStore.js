import { observable, action } from 'mobx';
import { SQT_ADDRESS, SQNET_ADDRESS } from '../../constants';
import Web3Store from './Web3Store';

import sqtAbi from './../../blockchain/artifacts/contracts/SQT.sol/SQT.json';
import sqnetAbi from './../../blockchain/artifacts/contracts/SQNET.sol/SQNET.json';
import getBn from '../../services/getBn';
import { makeObservable } from 'mobx';

export default class ContractsStore extends Web3Store {
  @observable SqtContract;
  @observable SqnetContract;

  constructor () {
    super();
    makeObservable(this);
  }

  fetchBalance = async (address) => {
    const balance = await this.SqtContract.methods.balanceOf(address).call();
    return balance;
  }

  fetchLastClaim = async (address) => {
    const lastClaimResponse = await this.SqnetContract.methods.getLastClaim(address).call();
    return lastClaimResponse;
  }

  getSqtReward = async (address) => {
    const rewardWallet = await this.SqtContract.methods.rewardWallet().call();
    const userSqtBalance = getBn(await this.SqtContract.methods.balanceOf(address).call());
    const totalSupply = getBn(await this.SqtContract.methods.totalSupply().call());
    const rewardBalanceSqtBefore = getBn(await this.SqtContract.methods.balanceOf(rewardWallet).call());

    const rewardPercentage = userSqtBalance.multipliedBy(getBn(100 * (10 ** 18))).dividedBy(totalSupply);
    const userReward = rewardBalanceSqtBefore.multipliedBy(rewardPercentage).dividedBy(getBn(100)).dividedBy(getBn(10 ** 18));
    return userReward;
  }

  claimRewards = async (address, token0, token1, callback) => {
    return this.SqnetContract.methods.claimRewards(token0, token1).send({ from: address }).on('confirmation', () => {
      if (callback) callback();
    });
  }

  fetchAvailableRewards = async (address) => {
    const sqtRewards = await this.getSqtReward(address);
    let usdtRewards;

    if (sqtRewards >= 1) {
      usdtRewards = await this.SqnetContract.methods.getAvailableUsdtRewards(sqtRewards.toFixed(0)).call({ from: address });
    } else {
      usdtRewards = 0;
    }

    return usdtRewards / 10 ** 18;
  }

  @action setSqtContract = (web3) => {
    this.SqtContract = new web3.eth.Contract(sqtAbi.abi, SQT_ADDRESS);
  }

  @action setSqnetContract = (web3) => {
    this.SqnetContract = new web3.eth.Contract(sqnetAbi.abi, SQNET_ADDRESS);
  }
}
