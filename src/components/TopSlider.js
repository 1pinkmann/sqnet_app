import React from "react";
import Slider from "react-slick";

export default function TopSlider(props) {
  var settings = {
    dots: false,
    arrows: false,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 3000,
    centerMode: true,
    variableWidth: true,
    className: "center",
    centerPadding: "60px",
    cssEase: "ease-in-out"
  };
  return (
    <Slider {...settings}>
      <span></span>
      <div className="mob-scroll" style={{ width: "100px" }}>
        <span className="sp-item-top">Savings awaiting distribution</span>
        <span className="sp-item-bottom">{props.holdersPot} BNB</span>
      </div>

      <div className="mob-scroll" style={{ width: "115px" }}>
        <span className="sp-item-top">Lottery Pot</span>
        <span className="sp-item-bottom">{props.lotteryPot} SQNE</span>
      </div>
      <div className="mob-scroll" style={{ width: "130px" }}>
        <span className="sp-item-top">Holders Till Buyback</span>
        <span className="sp-item-bottom">{props.nextBuyBack}</span>
      </div>
      {/* <div className="mob-scroll" style={{ width: "100px" }}>
        <span className="sp-item-top">BuyBack Pot</span>
        <span className="sp-item-bottom">{props.distribute} BNB</span>
      </div> */}
      {/* <div className="mob-scroll" style={{ width: "150px" }}>
        <span className="sp-item-top">Total Airdropped Pot</span>
        <span className="sp-item-bottom">{props.airDroppedPot} SQNE</span>
      </div> */}
      {/* <div className="mob-scroll" style={{ width: "150px" }}>
        <span className="sp-item-top">ALL-TIME REWARDS</span>
        <span className="sp-item-bottom">{props.distributedRewards} BUSD</span>
      </div> */}

      {/* <div className="mob-scroll" style={{ width: "350px" }}>
        <span className="sp-item-Greeting2">{props.Balance}</span>
        <span className="sp-item-Greeting3">Welcome to Ethernal Finance</span>
        <span></span>
      </div> */}
    </Slider>
  );
}
