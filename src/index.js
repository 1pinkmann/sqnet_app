import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import SqnetContractProvider from "./contexts/SqnetContractProvider";
import SqtContractProvider from "./contexts/SqtContractProvider";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./index.css";
import "./scss/style.scss";
import Web3Provider from "./contexts/Web3Provider";

ReactDOM.render(
  <React.StrictMode>
    <Web3Provider>
      <SqnetContractProvider>
        <SqtContractProvider>
          <App />
        </SqtContractProvider>
      </SqnetContractProvider>
    </Web3Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
