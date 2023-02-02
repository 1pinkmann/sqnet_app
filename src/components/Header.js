import React from "react";
import { FiCopy } from "react-icons/fi";
import { BiWallet } from "react-icons/bi";
import { HiOutlineLogout } from "react-icons/hi";
import { Navbar } from "react-bootstrap";

// import logo from "../assets/images/appLogo.svg";
import Logo from "./Logo";

const Header = ({ accounts, setModalVisible, balance, disconnect }) => {

  return (
    <div className="header " style={{ zIndex: 999 }}>
      <div className="row ">
        <div className="col-md-12">
          <Navbar variant="dark" className="shadow-none">
            <Navbar.Brand href="/" style={{ zIndex: 999 }}>
              <Logo />
            </Navbar.Brand>
            {accounts[0] && <Navbar.Toggle aria-controls="basic-navbar-nav" />}

            <div className="navbar1 ms-auto">
              <div>
                {accounts[0] && (
                  <div className="nav-right d-flex flex-row align-items-center">
                    <div className="wallet-address-container">
                      <div className="wallet-add">
                        <BiWallet /> Your Wallet Address
                      </div>
                      <span className="add">
                        <FiCopy
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            navigator.clipboard.writeText(accounts[0])
                          }
                        />
                        {accounts[0].slice(0, 6)}...{accounts[0].slice(-10)}
                        <FiCopy
                          style={{ cursor: "pointer" }}
                          className="only-mobile"
                          onClick={() =>
                            navigator.clipboard.writeText(accounts[0])
                          }
                        />
                      </span>
                      <div>
                        {balance ? (
                          <>
                            <div className="text-gray">Your SQT Balance</div>
                            <div className="text-primary sub-header">
                              {Number(parseFloat(balance / 10 ** 18).toFixed(5))}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-gray">Your Token Balance</div>
                            <div className="text-primary sub-header">0</div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="">
                      <a
                        href="/"
                        style={{ textDecoration: "none" }}
                        onClick={(e) => {
                          e.preventDefault();
                          disconnect();
                        }}
                      >
                        <span className="signout">
                          <HiOutlineLogout />
                        </span>
                      </a>
                    </div>
                  </div>
                )}
                {!accounts[0] && (
                  <div className="update-preferences-btn mt-2 mb-2">
                    <button
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "12px 24px",
                        border: "transparent",
                      }}
                      className="btn-light-rounded"
                      variant="light"
                      onClick={() => setModalVisible(true)}
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Navbar>
        </div>
      </div>
    </div>
  );
};

export default Header;
