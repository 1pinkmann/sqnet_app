import React from "react";

function Popup2(props) {
  return props.trigger ? (
    <div className="popup2">
      <div className="popup-inner2">
        <button className="close-btn2" onClick={() => props.setTrigger(false)}>
          Close
        </button>
        {props.children}
      </div>
    </div>
  ) : (
    ""
  );
}

export default Popup2;
