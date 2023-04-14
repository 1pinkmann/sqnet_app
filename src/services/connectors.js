import WalletConnectProvider from "@walletconnect/web3-provider";
import { InjectedConnector } from "@web3-react/injected-connector";
// import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

export const injected = new InjectedConnector({
    supportedChainIds: [1, 5],
});

// export const walletConnectConnector = new WalletConnectConnector({
//     rpc: {
//         5: "https://bsc-testnet.public.blastapi.io"
//     },
// });

export const walletConnectProvider = new WalletConnectProvider({
    rpc: {
        5: "https://bsc-testnet.public.blastapi.io",
        1: "https://mainnet.infura.io/v3/"
    },
})