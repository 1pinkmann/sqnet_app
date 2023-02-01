import { observable, action } from 'mobx';
import { SQT_ADDRESS, SQNET_ADDRESS } from '../../constants';
import Web3Store from './Web3Store';

import sqtAbi from './../../blockchain/artifacts/contracts/SQT.sol/SQT.json';

export default class ContractsStore extends Web3Store {
  @observable SqtContract;
  @observable SqnetContract;

  @action setSqtContract () {
    this.SqtContract = new this.web3.eth.Contract(sqtAbi.abi, SQT_ADDRESS);
  }

  @action setSqnetContract () {
    this.SqnetContract = new this.web3.eth.Contract(sqtAbi.abi, SQNET_ADDRESS);
  }
}