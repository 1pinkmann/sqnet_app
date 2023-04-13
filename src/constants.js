import btc from "./assets/images/btc.png";
import eth from "./assets/images/eth.svg";
import toncoin from "./assets/images/toncoin.svg";
import imperial from "./assets/images/imperial.svg";
import hex from "./assets/images/hex.svg";
import volt from "./assets/images/volt.svg";
import saitama from "./assets/images/saitama.svg";
import shirio from "./assets/images/shirio.svg";
import usdc from "./assets/images/usdc.svg";
import usdt from "./assets/images/usdt.svg";

export const isTestnet = true;
export const SQNK_ADDRESS = '0x2596454C4341e1c05d34cb298062d1aBb18B76Be';
export const SQNET_ADDRESS = '0x5DBBb86b2729325D96d628E1E6A64BeFa0340E0F';

const options = [
  {
    id: 1,
    currency: "Binance Wrapped BTC",
    logo: btc,
    percent: 50,
    symbol: "BBTC",
    address: '0x9be89d2a4cd102d8fecc6bf9da793be995c22541'
  },
  {
    id: 2,
    currency: "Ethereum",
    logo: eth,
    percent: 50,
    symbol: "ETH",
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  {
    id: 3,
    currency: "TONCOIN",
    logo: toncoin,
    percent: 50,
    symbol: "TON",
    address: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1'
  },
  {
    id: 4,
    currency: "Imperial Obelisk",
    logo: imperial,
    percent: 50,
    symbol: "IMP",
    address: '0x2d5c73f3597b07f23c2bb3f2422932e67eca4543'
  },
  {
    id: 5,
    currency: "HEX",
    logo: hex,
    percent: 50,
    symbol: "HEX",
    address: '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39'
  },
  {
    id: 6,
    currency: "Volt Inu",
    logo: volt,
    percent: 50,
    symbol: "VOLT",
    address: '0x7db5af2b9624e1b3b4bb69d6debd9ad1016a58ac'
  },
  {
    id: 7,
    currency: "Saitama",
    logo: saitama,
    percent: 50,
    symbol: "SAITAMA",
    address: '0xce3f08e664693ca792cace4af1364d5e220827b2'
  },
  {
    id: 8,
    currency: "Shiryo Inu",
    logo: shirio,
    percent: 50,
    symbol: "SHIR",
    address: '0x1e2f15302b90edde696593607b6bd444b64e8f02'
  },
  {
    id: 9,
    currency: "USD Coin",
    logo: usdc,
    percent: 50,
    symbol: "USDC",
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  },
  {
    id: 10,
    currency: "Tether",
    logo: usdt,
    percent: 50,
    symbol: "USDT",
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
];

const testnetOptions = [
  {
    id: 1,
    currency: "USDC",
    logo: null,
    percent: 50,
    symbol: "USDC",
    address: '0x80c324364D98320eae65c6f2E68d58e0360a5aC7'
  },
  {
    id: 2,
    currency: "USDT",
    logo: null,
    percent: 50,
    symbol: "USDT",
    address: '0x9E1bA6DD8B2E2d84072820802093e46C24d7EB9d'
  },
  {
    id: 3,
    currency: "DAO",
    logo: null,
    percent: 50,
    symbol: "DAO",
    address: '0x97917Fc075f25E71ce177381b4d9Beb2a53e8DF6'
  },
  {
    id: 4,
    currency: "ETH",
    logo: null,
    percent: 50,
    symbol: "ETH",
    address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
  },
];

export const tokens = isTestnet ? testnetOptions : options;