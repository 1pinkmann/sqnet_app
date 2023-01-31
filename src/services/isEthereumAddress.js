export default function isEthereumAddress(address) {
    return address.match(/^0x[a-fA-F0-9]{40}$/g);
}