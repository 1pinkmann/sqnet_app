import React from "react";

import { ReactComponent as Rewards1 } from "../assets/images/rewards1.svg";
import { ReactComponent as Rewards2 } from "../assets/images/rewards2.svg";

const MobileMenu = (props) => {
  return (
    <div className="mobile-menu only-mobile  d-flex justify-content-around">
      <div
        className={props.view === 1 ? "selected-tab" : ""}
        onClick={() => {
          props.changeView(1);
        }}
      >
        <div>{props.view === 1 ? <Rewards2 /> : <Rewards1 />}</div>
        <div className="text-gray">Rewards</div>
      </div>
    </div>
  );
};

export default MobileMenu;
