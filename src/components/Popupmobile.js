import React from "react";

function Popup2mobile(props) {
  return props.trigger ? (
    <div className="popup2Mbl only-mobile">
      <div className="popup-inner2Mbl only-mobile">
        <button
          className="close-btn2Mbl only-mobile"
          onClick={() => props.setTrigger(false)}
        >
          Close
        </button>
        {props.children}
      </div>
    </div>
  ) : (
    ""
  );
}

export default Popup2mobile;
