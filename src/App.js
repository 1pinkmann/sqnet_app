import React from "react";
import Home from "./pages/Home";
import bg from './assets/images/bg.png'

import './scss/iframeDisable.scss';
import Toast from "./components/common/Toast";

const App = () => {
  return (
    <div className="app-wrapper" style={{ backgroundImage: `url(${bg})` }}>
      <Home />
      <Toast />
    </div>
  );
};

export default App;
