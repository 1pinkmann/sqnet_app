import ContractsStore from './ContractsStore';
import Web3Store from './Web3Store';

export default function RootStore (storage) {
  return {
    contractsStore: new ContractsStore(storage),
    web3Store: new Web3Store(storage)
  };
}
