import React from "react";


import { ReactComponent as Award } from "../assets/images/award.svg";


const PayoutDetails = (props) => {
  return (
    <div className="payout-wrap">
      <div className="payout-container">
        <div className="payout-icon1">
          <Award />
        </div>
        <div className="text-gray">Rewards Payout Cycle</div>
        <div className="text-primary">
          {Number(props.contractData.rewardCycle).toFixed(2)} %
        </div>
      </div>
      
      
    </div>
  );
};

export default PayoutDetails;
