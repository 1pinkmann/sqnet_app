import React from "react";
import bg from './assets/images/bg.png'
import { Provider } from "mobx-react";

import './scss/iframeDisable.scss';
import Toast from "./components/common/Toast";
import RootStore from './core/stores/RootStore';
import HomeController from "./components/Home/HomeController";

const App = () => {
  const mobxStore = RootStore(window.localStorage);

  return (
    <Provider {...mobxStore}>
      <div className="app-wrapper" style={{ backgroundImage: `url(${bg})` }}>
        <HomeController />
        <Toast />
      </div>
    </Provider>
  );
};

export default App;
