import { observable, action } from 'mobx';
import Web3 from 'web3';
import isMetamaskInstalled from './../../services/contract/isMetamaskInstalled';
import { walletConnectProvider } from './../../services/connectors';
import { isTestnet } from '../../constants';
import { makeObservable } from 'mobx';

export default class Web3Store {
  @observable web3;
  @observable accounts = [];
  @observable activeWallet = '';

  constructor () {
    makeObservable(this);
  }

  initWeb3 = async (type) => {
    if (isMetamaskInstalled() && type === "metamask" && window.ethereum) {
      try {
        this.setWeb3(new Web3(window.ethereum));
        let address = await window.ethereum.request({ method: "eth_requestAccounts" });
        this.setAccounts(address);
        localStorage.setItem("user", JSON.stringify({ wallet: "metamask", address }));
        this.setActiveWallet("metamask");

        window.ethereum.on('accountsChanged', (result) => {
          this.setAccounts(result);
        });
  
        window.ethereum.on("chainChanged", (chainId) => {
          this.handleChain(chainId, isTestnet);
        });
  
        window.ethereum.request({ method: "eth_chainId" }).then(chainId => {
          this.handleChain(chainId, isTestnet);
        });
      } catch (err) {
        console.log(err);
      }
    } else if (type === "universal") {
      if (!walletConnectProvider) return;
      this.setWeb3(new Web3(walletConnectProvider));
      try {
        const address = await walletConnectProvider.enable();
        this.setAccounts(address);
        localStorage.setItem("user", JSON.stringify({ wallet: "universal", address }));
        this.setActiveWallet("universal");
        walletConnectProvider.on("accountsChanged", (accounts) => {
          this.setAccounts(accounts);
        });
        walletConnectProvider.on("disconnect", this.handleDisconnect);
      } catch (err) {
        console.log(err);
      }
    }
  }

  async handleChain (chainId, testnet) {
    if (chainId !== (testnet ? "0x5" : "0x1")) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: (testnet ? "0x5" : "0x1") }],
        });
      } catch (switchError) {

        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: testnet ? "0x5" : "0x1",
                  rpcUrl: testnet ? 'https://goerli.infura.io/v3/e95eeda83f4e45f0ba8f79adb530310f' : 'https://mainnet.infura.io/v3/',
                  chainName: testnet ? "GoerliETH" : "Ethereum Mainnet"
                }
              ],
            });
          } catch (addError) {
            console.log(addError);
          }
        }
      }
    }
  }

  @action handleDisconnect = (callback) => {
    localStorage.removeItem("user");
    this.setActiveWallet("");
    this.setAccounts([]);
    this.setWeb3(null);
    if (callback) callback();
  }

  @action setWeb3 = (web3) => {
    this.web3 = web3;
  }

  @action setAccounts = (value) => {
    this.accounts = value;
  }

  @action setActiveWallet = (wallet) => {
    this.activeWallet = wallet;
  }
}