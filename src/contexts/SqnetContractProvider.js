import { createContext, useContext, useEffect, useState } from "react";
import sqnetAbi from './../blockchain/artifacts/contracts/SQNET.sol/SQNET.json';
import { Web3Context } from './Web3Provider';
import { isTestnet, SQNET_TESTNET } from './../constants';

export const SqnetContractContext = createContext('SqnetcontractContext');

const mainAddress = "0x9F5C0f998CBa40a3C85df8Ce9F9F466Eb3d13aC1";
const testAddress = SQNET_TESTNET;
const contractAddress = isTestnet ? testAddress : mainAddress;

export default function SqnetContractProvider({ children }) {
  const [SqnetContract, setSqnetContract] = useState(null);
  const { web3 } = useContext(Web3Context);

  useEffect(() => {

    if (web3) {
      setSqnetContract(new web3.eth.Contract(sqnetAbi.abi, contractAddress));
    }
  }, [web3]);

  return (
    <SqnetContractContext.Provider value={{ SqnetContract, contractAddress, testAddress, mainAddress }}>
      {children}
    </SqnetContractContext.Provider>
  )
}
