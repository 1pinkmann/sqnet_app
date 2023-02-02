import React from "react";
import Select, { components } from "react-select";
import { RiDeleteBin6Line } from "react-icons/ri";
import OutsideClickHandler from "react-outside-click-handler";
import { FiSearch } from "react-icons/fi";
import ReactSlider from "react-slider";

const TokenSlider = (props) => {
  const ValueContainer = ({ children, ...subProps }) => {
    let image = `./images/${props.item.name?.toLowerCase()}-logo.png`;
    return (
      <components.ValueContainer {...subProps}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span>
            <img
              src={image}
              style={{
                maxWidth: "17px",
                maxHeight: "70%",
                marginRight: 2,
                marginLeft: 2,
              }}
              alt=""
            />
          </span>
          <span style={{ display: "flex" }}>{children}</span>
        </div>
      </components.ValueContainer>
    );
  };

  const Control = ({ children, ...subProps }) => {
    return (
      <div
        style={{ cursor: "pointer" }}
        onTouchEnd={!props.isMenuOpen ? props.setMenuOpen : props.setMenuClose}
        onClick={!props.isMenuOpen ? props.setMenuOpen : props.setMenuClose}
      >
        <components.Control {...subProps}>{children}</components.Control>
      </div>
    );
  };

  const Option = ({ children, ...subProps }) => {
    let image = `./images/${subProps.data.label.toLowerCase()}-logo.png`;
    return (
      <components.Option {...subProps}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              background: makeTransparent(subProps.data.color),
              padding: "4px",
              borderRadius: 5,
              lineHeight: 0,
            }}
          >
            <img src={image} style={{ maxWidth: "14px", maxHeight: "100%" }} alt="" />
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: "10px",
              borderBottom: "1px solid rgba(255,255,255,.1)",
              paddingBottom: "2px",
              width: "100%",
            }}
          >
            {children}
          </div>
        </div>
      </components.Option>
    );
  };

  const IndicatorsContainer = ({ children, ...subProps }) => {
    return (
      <div
        style={{ cursor: "pointer" }}
        onTouchEnd={!props.isMenuOpen ? props.setMenuOpen : props.setMenuClose}
        onClick={!props.isMenuOpen ? props.setMenuOpen : props.setMenuClose}
      >
        <components.IndicatorsContainer {...subProps}>
          {children}
        </components.IndicatorsContainer>
      </div>
    );
  };

  const Menu = ({ children, ...subProps }) => {
    return (
      <OutsideClickHandler onOutsideClick={props.setMenuClose}>
        <div
          style={{
            width: "100%",
            position: "absolute",
            zIndex: 99,
            background: "#20053a",
            boxShadow: "0px 12px 40px rgba(53, 21, 72, 0.58)",
            borderRadius: "12px 12px 0 0",
          }}
          className="custom-dropdown"
        >
          <div
            style={{
              color: "black",
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "40px",
                justifyContent: "center",
              }}
            >
              <FiSearch size="1.3em" color="#fff" />
            </div>
            <input
              type="text"
              id="tokenSearch"
              name="tokenSearch"
              placeholder="Search"
              value={props.tokenSearch}
              onChange={props.setTokenSearch}
              className="form-control"
              style={{
                background: "transparent",
                color: "#ffffff",
                border: "none",
                boxShadow: "none",
                fontSize: "14px",
              }}
              autoFocus
              autoComplete="off"
            />
          </div>
          <components.Menu {...subProps}>{children}</components.Menu>
        </div>
      </OutsideClickHandler>
    );
  };

  const makeTransparent = (value) => {
    let newStr = value.slice(0, value.length - 2);
    newStr += "0.2)";
    return newStr;
  };

  const customStyles = {
    container: (provided, state) => ({
      ...provided,
      width: "100%",
      padding: 0,
      border: "none",
      color: "#fff",
      fontWeight: 700,
      height: "100%",
      boxShadow: "none",
      fontSize: 12,
      borderRadius: 20,
      position: "initial",
    }),
    control: (provided, state) => ({
      ...provided,
      height: "45px",
      background: "transparent",
      boxShadow: "none",
      border: "none",
      borderTopLeftRadius: 12,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 12,
      fontWeight: 700,
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: "#fff",
      fontWeight: 700,
      boxShadow: "none",
      backgroundColor: state.isFocused ? "blue" : ""
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: "#fff",
      "&:hover": {
        color: "#fff",
      },
    }),
    menuList: (provided, state) => ({
      ...provided,
      background: "#20053a",
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    }),
    menu: (provided) => ({
      ...provided,
      marginTop: 0,
      background: "transparent",
      width: "99.8%",
      marginLeft: "0",
      boxShadow: "none",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "rgba(255,255,255,0.1)" : "",
      textAlign: "left",
      fontWeight: 700,
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.1)",
      },
    }),
    indicatorsContainer: (provided, state) => ({
      ...provided,
      padding: 0,
      div: {
        padding: "0px 2px 0 0",
      },
    }),
    valueContainer: (provided, state) => ({
      ...provided,
      padding: 0,
    }),
  };

  return (
    <div className="slider-dropdown">
      <Select
        value={{
          value: props.item.name,
          label: props.item.name?.toUpperCase(),
        }}
        onChange={(e) => {
          props.handleSelect(e);
          props.setMenuClose();
        }}
        menuIsOpen={props.isMenuOpen}
        isSearchable={false}
        options={props.tokens}
        backspaceRemovesValue={false}
        components={{
          IndicatorSeparator: () => null,
          ValueContainer,
          Menu,
          Control,
          Option,
          IndicatorsContainer,
        }}
        styles={customStyles}
      />
      <div>
        <ReactSlider
          className={
            props.isScrolling ? "horizontal-slider-scroll" : "horizontal-slider"
          }
          thumbClassName={
            props.item.value === 0 ? "example-thumb-hide" : "example-thumb"
          }
          trackClassName={
            props.item.value === 0 ? "example-track-hide" : "example-track"
          }
          onChange={props.handleChange}
          value={props.item.value}
          style={props.isScrolling ? { width: "50%" } : {}}
        />
      </div>
      <div className="value-container d-flex align-items-center">
        <input
          type="text"
          value={props.item.value}
          style={
            props.item.value === 100
              ? { paddingLeft: "4px" }
              : props.item.value === 0
                ? { paddingLeft: "17px" }
                : { paddingLeft: "10px" }
          }
          max={100 - props.total + props.item.value}
          min={0}
          onChange={(e) => {
            props.handleChange(e.target.value);
          }}
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <div id="percentage-div">%</div>
      </div>
      <span onClick={props.removeToken} className="delete-bin">
        <RiDeleteBin6Line />
      </span>
    </div>
  );
};

export default TokenSlider;
