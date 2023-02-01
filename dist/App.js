"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _Home = _interopRequireDefault(require("./pages/Home"));
var _bg = _interopRequireDefault(require("./assets/images/bg.png"));
var _mobxReact = require("mobx-react");
require("./scss/iframeDisable.scss");
var _Toast = _interopRequireDefault(require("./components/common/Toast"));
var _RootStore = _interopRequireDefault(require("./core/stores/RootStore"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var App = function App() {
  var mobxStore = (0, _RootStore.default)(window.localStorage);
  return /*#__PURE__*/_react.default.createElement(_mobxReact.Provider, mobxStore, /*#__PURE__*/_react.default.createElement("div", {
    className: "app-wrapper",
    style: {
      backgroundImage: "url(".concat(_bg.default, ")")
    }
  }, /*#__PURE__*/_react.default.createElement(_Home.default, null), /*#__PURE__*/_react.default.createElement(_Toast.default, null)));
};
var _default = App;
exports.default = _default;