import React from "react";

import sendMoney from '../assets/images/send-money.svg'

const EarningsDetails = ({ availableRewards }) => {
  return (
    <div className="earning-details-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', marginRight: '8px' }}>
          <img src={sendMoney} width={32} height={32} alt="" />
        </div>

        <div className="text-start">
          <div className="earnings-amount">
            {availableRewards} USDT
          </div>

        </div>
      </div>
      <div className="earnings-subtitle">Earnings Available</div>

    </div>
  );
};

export default EarningsDetails;
