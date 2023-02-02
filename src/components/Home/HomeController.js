
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react'
import HomeView from './HomeView'
import HomeViewModel from './../../core/viewModels/HomeViewModel';
import { toast } from 'react-toastify';

@inject(stores => ({ contractsStore: stores.contractsStore, web3Store: stores.web3Store }))
@observer
class HomeController extends Component {
  viewModel = new HomeViewModel(this.props.contractsStore, this.props.web3Store);
  timer;

  lastClaimBlockPassed() {
    return (Date.now() - (this.viewModel.lastClaim * 1000)) / 60000 > 3;
  }

  init = async () => {
    clearInterval(this.timer);

    const $p = this.props;

    if (!$p.web3Store.web3 || !$p.web3Store.accounts[0]) return;

    $p.contractsStore.setSqnetContract($p.web3Store.web3);
    $p.contractsStore.setSqtContract($p.web3Store.web3);

    await this.viewModel.fetchBalance();
    if (this.viewModel.balance > 0) {
      await this.viewModel.fetchAvailableRewards();
    }
    await this.viewModel.fetchLastClaim();

    this.viewModel.setWithdrawalEnabled(this.lastClaimBlockPassed() && this.viewModel.balance > 0 && this.viewModel.availableRewards > 0);

    this.timer = setInterval(() => {
      if (this.lastClaimBlockPassed() && this.viewModel.balance > 0 && this.viewModel.availableRewards > 0) {
        this.viewModel.setWithdrawalEnabled(true);
        clearInterval(this.timer);
      }
    }, 10000);
  }

  async componentDidMount () {
    const $p = this.props;

    const connectedUser = JSON.parse(localStorage.getItem('user'));
    if (connectedUser) {
      if (!$p.web3Store.web3 && connectedUser.wallet) {
        await $p.web3Store.initWeb3(connectedUser.wallet);
      }
    }

    this.init();

    if ($p.web3Store.web3) {
      $p.web3Store.web3._provider.on('accountsChanged', () => {
        this.init();
      });
    }
  }

  componentWillUnmount () {
    clearInterval(this.timer);
  }

  connect = async (type) => {
    await this.props.web3Store.initWeb3(type);
    this.viewModel.setModalVisible(false);
    this.init();
  }

  disconnect = () => {
    const connectedUser = JSON.parse(localStorage.getItem('user'));

    if (connectedUser.wallet !== "universal") return;
    this.props.web3Store.web3._provider.disconnect();
    window.location.reload();
  }

  hoursLeft = ({ minutes }) => <span>{minutes}</span>;

  claimRewards = async (token0, token1) => {
    if (this.viewModel.withdrawalEnabled) {
      this.viewModel.claimRewards(token0, token1);
    } else {
      const timeLeft = 3 - ((Date.now() - this.viewModel.lastClaim * 1000) / 60000);

      toast(  
        <span>
          {Number(this.viewModel.balance) === 0 ? 
            'No SQT balance available' : 
            Number(this.viewModel.availableRewards) === 0 ?
            'No rewards avaialble' : 
            <>
              You can only claim once per 3 mins
              ({Math.ceil(timeLeft)} left)
            </>
          }
        </span>
      );
    }
  }

  render () {
    return (
      <HomeView viewModel={this.viewModel} connect={this.connect} disconnect={this.disconnect} claimRewards={this.claimRewards} />
    )
  }
}

export default HomeController;