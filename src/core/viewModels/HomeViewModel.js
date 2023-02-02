import { observable, makeObservable, action, runInAction } from 'mobx';
import round from '../../services/round';

export default class HomeViewModel {
  @observable modalVisible = false;
  @observable withdrawalEnabled = false;
  @observable availableRewards = 0;
  @observable lastClaim = 0;
  @observable balance = 0;
  @observable countdownActive = false;

  constructor (contractsStore, web3Store) {
    this.contractsStore = contractsStore;
    this.web3Store = web3Store;
    makeObservable(this);
  }

  fetchAvailableRewards = async () => {
    const rewards = await this.contractsStore.fetchAvailableRewards(this.web3Store.accounts[0]);
    runInAction(() => {
      this.availableRewards = rewards < 1 ? round(rewards, 2) : rewards.toFixed(2)
    });
  }

  claimRewards = async (token0, token1) => {
    await this.contractsStore.claimRewards(this.web3Store.accounts[0], token0, token1, () => {
      this.setWithdrawalEnabled(false);
      this.fetchAvailableRewards();
      this.fetchLastClaim();
    });
  }

  fetchBalance = async () => {
    const balance = await this.contractsStore.fetchBalance(this.web3Store.accounts[0]);

    runInAction(() => {
      this.balance = balance;
    });
  }

  fetchLastClaim = async () => {
    const lastClaim = await this.contractsStore.fetchLastClaim(this.web3Store.accounts[0]);
    const timeRemained = 3 - ((Date.now() - lastClaim * 1000) / 60000);

    runInAction(() => {
      this.lastClaim = lastClaim;
      this.timeRemained = timeRemained > 0 ? timeRemained : 0;
    });
  }

  @action setModalVisible = (value) => {
    this.modalVisible = value;
  }

  @action setWithdrawalEnabled = (value) => {
    this.withdrawalEnabled = value;
  }

  @action setAvailableRewards = (value) => {
    this.availableRewards = value;
  }

  @action setCountdownActive = (value) => {
    this.countdownActive = value;
  }
}