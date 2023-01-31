import React, { useState, useEffect, useContext } from "react";

import Header from "../components/Header";
import Rewards from "../components/Rewards";
import { Modal } from "react-bootstrap";
import close from "../assets/images/close.svg";
import { SqnetContractContext } from './../contexts/SqnetContractProvider';
import { Web3Context } from "../contexts/Web3Provider";
import { SqtContractContext } from './../contexts/SqtContractProvider';

const Home = () => {
  const [smShow, setSmShow] = useState(false);
  const [withdrawalEnabled, setWithdrawalEnabled] = useState(false);
  const { SqnetContract } = useContext(SqnetContractContext);
  const { SqtContract } = useContext(SqtContractContext);
  const { web3, accounts, activeWallet, initWeb3, handleDiconnect } = useContext(Web3Context);

  const [balance, setBalance] = useState(0);

  const claimRewards = async (token0, token1) => {
    console.log(token0);
    console.log(token1);
    await SqnetContract.methods.claimRewards(token0, token1).send({ from: accounts[0] });
  };

  async function connect(type) {
    initWeb3(type);
    setSmShow(false);
  }

  function disconnect() {
    const connectedUser = JSON.parse(localStorage.getItem('user'));

    if (connectedUser.wallet !== "universal") return;
    window.location.reload();
    web3._provider.disconnect();
  }

  useEffect(() => {
    async function init() {
      const balance = await SqtContract.methods.balanceOf(accounts[0]).call();
      setBalance(balance);
      const lastClaim = await SqnetContract.methods.getLastClaim(accounts[0]).call();
      setWithdrawalEnabled((Date.now() - (lastClaim * 1000))/ 60000 > 3);
    }

    const connectedUser = JSON.parse(localStorage.getItem('user'));

    if (connectedUser) {

      if (!web3 && connectedUser.wallet) {
        initWeb3(connectedUser.wallet);
      }
    }

    if (web3 && SqtContract && accounts[0] && SqnetContract) {
      init();
    }

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [web3, initWeb3, SqtContract, SqnetContract, accounts]);

  return (
    <div className="container-fluid app-container">
      <Header
        accounts={accounts}
        disconnect={handleDiconnect}
        setSmShow={setSmShow}
        balance={balance}
      />
      <Rewards withdrawalEnabled={withdrawalEnabled} userClaimRewards={claimRewards} />
      <Modal
        size="sm"
        show={smShow}
        onHide={() => setSmShow(false)}
        aria-labelledby="example-modal-sizes-title-md"
        className="custom-modal-squid"
        style={{ zIndex: 999999 }}
        centered={true}
      >
        <Modal.Header>
          <h5 style={{ fontSize: "20px", fontWeight: "bold" }}>
            Connect your Wallet
          </h5>

          <div className="close-img">
            <img
              src={close}
              alt="close"
              style={{ cursor: "pointer" }}
              onClick={() => setSmShow(false)}
            />
          </div>
        </Modal.Header>
        <Modal.Body className="exchange-modal">
          <button
            className="btn-custom-squid mb-0"
            onClick={() => { connect("metamask") }}
          >
            Metamask
          </button>
          <div className="wallet-modal-spacer" />
          <button
            className="btn-custom-squid mb-0"
            onClick={() => activeWallet === "universal" ? disconnect() : connect("universal")}
          >
            Trust Wallet
          </button>
          <div className="wallet-modal-spacer" />
          <button
            className="btn-custom-squid mb-0"
            onClick={() => activeWallet === "universal" ? disconnect() : connect("universal")}
          >
            Walletconnect
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Home;
