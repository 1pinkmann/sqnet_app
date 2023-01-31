import { createContext, useCallback, useEffect, useState } from "react"
import Web3 from "web3";
import isMetamaskInstalled from '../services/contract/isMetamaskInstalled';
import { walletConnectProvider } from './../services/connectors';
import { isTestnet } from './../constants';

export const Web3Context = createContext('web3Context');

function Web3Provider({ children }) {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [activeWallet, setActiveWallet] = useState("");

  let handleDiconnect = () => {
    localStorage.removeItem("user");
    setActiveWallet("");
    setAccounts([]);
    setWeb3(null);
  }

  const initWeb3 = useCallback(async (type) => {


    if (isMetamaskInstalled() && type === "metamask") {

      try {
        setWeb3(new Web3(window.ethereum));
        let address = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccounts(address);
        localStorage.setItem("user", JSON.stringify({ wallet: "metamask", address }));
        // setCookie("user", { wallet: "metamask", address });
        setActiveWallet("metamask");
      } catch (err) {
        console.log(err);
      }

    } else if (type === "universal") {
      if (!walletConnectProvider) return;
      setWeb3(new Web3(walletConnectProvider));
      try {
        walletConnectProvider.enable().then(address => {
          setAccounts(address);
          localStorage.setItem("user", JSON.stringify({ wallet: "universal", address }));
          setActiveWallet("universal");
        }).catch(() => {
          console.log("user closed modal");
        });

        walletConnectProvider.on("accountsChanged", (accounts) => {
          console.log("accounts changed");
        });

        // Subscribe to chainId change
        // walletConnectProvider.on("chainChanged", (chainId) => {
        //     console.log(chainId);
        // });

        // Subscribe to networkId change
        walletConnectProvider.on("disconnect", handleDiconnect);
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const web3Found = new Web3(window.ethereum);
      setWeb3(web3Found);

      async function handleChain(chainId, testnet) {
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
  
      if (web3Found && web3Found._provider.isMetaMask) {
        window.ethereum.on('accountsChanged', (result) => {
          console.log(result);
          setAccounts(result);
        });
  
        window.ethereum.on("chainChanged", (chainId) => {
          handleChain(chainId, isTestnet);
        });
  
        window.ethereum.request({ method: "eth_chainId" }).then(chainId => {
          handleChain(chainId, isTestnet);
        });
      }
    }
  }, []);

  return (
    <Web3Context.Provider value={{ web3, initWeb3, activeWallet, accounts, setAccounts, handleDiconnect }}>
      {children}
    </Web3Context.Provider>
  )
}

export default Web3Provider;