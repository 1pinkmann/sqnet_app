
export default function isMetamaskInstalled () {
    if (typeof window.ethereum != undefined) {
        return Boolean(window.ethereum && window.ethereum.isMetaMask);
    }
}