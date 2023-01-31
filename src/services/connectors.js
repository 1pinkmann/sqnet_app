import WalletConnectProvider from "@walletconnect/web3-provider";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

export const injected = new InjectedConnector({
    supportedChainIds: [1, 5],
});

export const walletConnectConnector = new WalletConnectConnector({
    rpc: {
        5: "https://goerli.infura.io/v3/e95eeda83f4e45f0ba8f79adb530310f"
    },
});

export const walletConnectProvider = new WalletConnectProvider({
    rpc: {
        5: "https://goerli.infura.io/v3/e95eeda83f4e45f0ba8f79adb530310f",
        1: "https://mainnet.infura.io/v3/"
    },
})