import React from "react";
import Home from "./pages/Home";
import bg from './assets/images/bg.png'
import { Provider } from "mobx-react";

import './scss/iframeDisable.scss';
import Toast from "./components/common/Toast";
import RootStore from './core/stores/RootStore';

const App = () => {
  const mobxStore = RootStore(window.localStorage);

  return (
    <Provider {...mobxStore}>
      <div className="app-wrapper" style={{ backgroundImage: `url(${bg})` }}>
        <Home />
        <Toast />
      </div>
    </Provider>
  );
};

export default App;
