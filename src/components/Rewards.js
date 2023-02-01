import React, { useState } from "react";
import RewardsChart from "./RewardsChart";
import TokenSlider from "./TokenSlider";
import AddAnother from "./AddAnother";
import EarningsDetails from "./EarningsDetails";
import left from "../assets/images/left.svg";
import right from "../assets/images/right.svg";
import chartImg from "../assets/images/graph.svg";
import ChartSideItem from "./ChartSideItem";
import RoundedButton from "./RoundedButton";
import RewardsCurrItem from "./RewardsCurrItem";

import btc from "../assets/images/btc.png";
import eth from "../assets/images/eth.svg";
import toncoin from "../assets/images/toncoin.svg";
import imperial from "../assets/images/imperial.svg";
import hex from "../assets/images/hex.svg";
import volt from "../assets/images/volt.svg";
import saitama from "../assets/images/saitama.svg";
import shirio from "../assets/images/shirio.svg";
import usdc from "../assets/images/usdc.svg";
import usdt from "../assets/images/usdt.svg";
import { isTestnet } from "../constants";

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

const tokens = isTestnet ? testnetOptions : options;

const LeftContent = ({ userClaimRewards, withdrawalEnabled, availableRewards }) => {
  const [currency1, setCurrency1] = useState(tokens[0].address);
  const [currency2, setCurrency2] = useState(tokens[1].address);

  const getChosenOption = (address) => {
    const item = tokens.filter((option) => {
      return option.address === address;
    });
    if (item.length > 0) {
      return item[0];
    } else {
      return {};
    }
  };

  return (
    <>
      <div className="container-centered-v">
        <div className="payout-info">
          <div className="vertical-center">
            <div className="mobile-gap">
              <img
                src={left}
                width={427}
                className="img-fluid"
                style={{ display: "flex", marginLeft: "auto" }}
                alt=""
              />
            </div>
          </div>
          <div className="mx-auto">
            <div className="flex-center">
              <div className="payoutinfo2">
                <div style={{ marginBottom: "32px" }}>
                  <EarningsDetails availableRewards={availableRewards} />
                </div>
                <div className="flex" style={{ marginBottom: "32px" }}>
                  <div className="flex w-100">
                    <img src={chartImg} width={180} className="img-fluid" alt="" />
                  </div>
                  <div className="flex w-100 full-center">
                    <div className="flex flex-col">
                      <ChartSideItem
                        color="#F7B89D"
                        option={getChosenOption(currency1)}
                      />
                      <ChartSideItem
                        color="#C21F48"
                        option={getChosenOption(currency2)}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <RewardsCurrItem
                    options={tokens}
                    optionsKey={"id"}
                    chosenOption={currency1}
                    onChange={(chosenOption) => {
                      setCurrency1(chosenOption);
                    }}
                    logo={getChosenOption(currency1).logo}
                    text={getChosenOption(currency1).symbol}
                    percent={getChosenOption(currency1).percent}
                  />
                  <RewardsCurrItem
                    options={tokens}
                    optionsKey={"id"}
                    chosenOption={currency2}
                    onChange={(chosenOption) => {
                      setCurrency2(chosenOption);
                    }}
                    logo={getChosenOption(currency2).logo}
                    text={getChosenOption(currency2).symbol}
                    percent={getChosenOption(currency1).percent}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex w-100">
                    <RoundedButton
                      className={"danger w-100"}
                      onClick={() => userClaimRewards(currency1, currency2)}
                      style={{ opacity: !withdrawalEnabled ? 0.5 : null }}
                    >
                      Claim Savings
                    </RoundedButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="vertical-center">
            <div className="mobile-gap">
              <img
                src={right}
                width={427}
                className="img-fluid"
                style={{ display: "flex", marginRight: "auto" }}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftContent;
