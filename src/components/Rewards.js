import React from "react";
import EarningsDetails from "./EarningsDetails";
import left from "../assets/images/left.svg";
import right from "../assets/images/right.svg";
import chartImg from "../assets/images/graph.svg";
import ChartSideItem from "./ChartSideItem";
import RoundedButton from "./RoundedButton";
import RewardsCurrItem from "./RewardsCurrItem";
import { tokens } from "../constants";
import { observer } from "mobx-react";

const LeftContent = ({ userClaimRewards, viewModel }) => {
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
                  <EarningsDetails availableRewards={viewModel.availableRewards} />
                </div>
                <div className="flex" style={{ marginBottom: "32px" }}>
                  <div className="flex w-100">
                    <img src={chartImg} width={180} className="img-fluid" alt="" />
                  </div>
                  <div className="flex w-100 full-center">
                    <div className="flex flex-col">
                      <ChartSideItem
                        color="#F7B89D"
                        option={getChosenOption(viewModel.token0)}
                      />
                      <ChartSideItem
                        color="#C21F48"
                        option={getChosenOption(viewModel.token1)}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <RewardsCurrItem
                    options={tokens}
                    optionsKey={"id"}
                    chosenOption={viewModel.token0}
                    onChange={(chosenOption) => {
                      viewModel.setToken0(chosenOption);
                    }}
                    logo={getChosenOption(viewModel.token0).logo}
                    text={getChosenOption(viewModel.token0).symbol}
                    percent={getChosenOption(viewModel.token0).percent}
                  />
                  <RewardsCurrItem
                    options={tokens}
                    optionsKey={"id"}
                    chosenOption={viewModel.token1}
                    onChange={(chosenOption) => {
                      viewModel.setToken1(chosenOption);
                    }}
                    logo={getChosenOption(viewModel.token1).logo}
                    text={getChosenOption(viewModel.token1).symbol}
                    percent={getChosenOption(viewModel.token0).percent}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex w-100">
                    <RoundedButton
                      className={"danger w-100"}
                      onClick={() => userClaimRewards(viewModel.token0, viewModel.token1)}
                      style={{ opacity: !viewModel.withdrawalEnabled ? 0.5 : null }}
                    >
                      Claim Earnings
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

export default observer(LeftContent);
