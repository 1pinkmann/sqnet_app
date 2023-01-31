import React, { useState } from "react";
import { transfer } from "../functions";

function Transfer({ connectWallet, userAddress, balance }) {
  const [value, setValue] = useState("");
  const [recipient, setRecipient] = useState("");

  return (
    <div className="TransferInfoBox">
      <br />
      <div class="TransferInfoHeader">Transfer</div>
      <br />
      <div className="text-gray only-mobile">Your SQNE Balance</div>
                    <div className="text-primary sub-header only-mobile">
                      {Number(balance).toFixed(2)}
                    </div>
      <br/>
      <div class="text-primary mt-3">Send to :</div>
      <div class="transfer-input input" >
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          onPaste={(e) => setRecipient(e.target.value)}
           style={{ width: "300px" }}
          placeholder="0x0000....."
        />
      </div>
      <br />
      <div class="text-primary mt-3">Amount :</div>
      <div class="text-primary mt-3 transfer-input input" >
        <input
          type="text"
           style={{  width: "300px" }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0.0"
        />{" "}
        SQNE
      </div>
      <br />
      <div>
        <button
          onClick={
            !userAddress ? connectWallet : () => transfer(recipient, value)
          }
          type="submit"
          className="button button--v1 exchange__button">
          {!userAddress ? "Connect Wallet" : "Send"}
        </button>
      </div>
    </div>
  );
}

export default Transfer;