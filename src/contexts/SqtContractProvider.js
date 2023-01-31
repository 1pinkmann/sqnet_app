import { createContext, useContext, useEffect, useState } from "react";
import sqtAbi from '../blockchain/artifacts/contracts/SQT.sol/SQT.json';
import { Web3Context } from './Web3Provider';
import { isTestnet, SQT_ADDRESS } from './../constants';

export const SqtContractContext = createContext('SqtContractContext');

const mainAddress = "0x9F5C0f998CBa40a3C85df8Ce9F9F466Eb3d13aC1";
const testAddress = SQT_ADDRESS;

const contractAddress = isTestnet ? testAddress : mainAddress;

export default function SqtContractProvider({ children }) {
  const [SqtContract, setSqtContract] = useState(null);
  const { web3 } = useContext(Web3Context);

  useEffect(() => {

    if (web3) {
      setSqtContract(new web3.eth.Contract(sqtAbi.abi, contractAddress));
    }
  }, [web3]);

  return (
    <SqtContractContext.Provider value={{ SqtContract, contractAddress, testAddress, mainAddress }}>
      {children}
    </SqtContractContext.Provider>
  )
}
