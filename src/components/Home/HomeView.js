import React, { useEffect } from "react";
import { observer, inject } from 'mobx-react';

import Header from "../Header";
import Rewards from "../Rewards";
import { Modal } from "react-bootstrap";
import close from "../../assets/images/close.svg";

function HomeView ({ web3Store, connect, disconnect, claimRewards, viewModel }) {
  const { accounts, activeWallet, handleDiconnect } = web3Store;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  return (
    <div className="container-fluid app-container">
      <Header
        accounts={accounts}
        disconnect={activeWallet === 'universal' ? () => disconnect() : () => handleDiconnect(() => viewModel.setAvailableRewards(0))}
        setModalVisible={viewModel.setModalVisible}
        balance={viewModel.balance}
      />
      <Rewards withdrawalEnabled={viewModel.withdrawalEnabled} userClaimRewards={claimRewards} availableRewards={viewModel.availableRewards} />
      <Modal
        size="sm"
        show={viewModel.modalVisible}
        onHide={() => viewModel.setModalVisible(false)}
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
              onClick={() => viewModel.setModalVisible(false)}
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

export default inject(stores => ({ contractsStore: stores.contractsStore, web3Store: stores.web3Store }))(observer(HomeView));
