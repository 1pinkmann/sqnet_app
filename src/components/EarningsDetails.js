import React from "react";

import sendMoney from '../assets/images/send-money.svg'

const EarningsDetails = () => {
  return (
    <div className="earning-details-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', marginRight: '8px' }}>
          <img src={sendMoney} width={32} height={32} alt="" />
        </div>

        <div className="text-start">
          <div className="earnings-amount">
            0 BNB
          </div>

        </div>
      </div>
      <div className="earnings-subtitle">Earnings Available</div>

    </div>
  );
};

export default EarningsDetails;
