import React from "react";


const OtherDetails=(props)=>{
  
  const walletAge = props.walletAge ? props.walletAge : '2 Month, 12 Days';
  const highestBal = props.highestBal ? props.highestBal : '2,000,321.97';
  const change24 = props.change24 ? props.change24 : '+2,694.0';

  return (
    <div className="row other-details mt-5 mb-4">
      <div className='col-md-4 col-6 mt-3'>
      	<div className='text-gray'>24H Change</div>
      	<div className='text-primary'>{change24} PLX</div>
      </div>
      <div className='col-md-4 col-6 mt-3'>
      	<div className='text-gray'>Highest Balance</div>
      	<div className='text-primary'>{highestBal} PLX</div>
      </div>
      <div className='col-md-4 col-12 mt-3'>
      	<div className='text-gray'>Wallet Age</div>
      	<div className='text-primary'>{walletAge}</div>
      </div>
    </div>
  );
}

export default OtherDetails;
