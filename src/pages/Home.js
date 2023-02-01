import React, { useState, useEffect, useContext } from "react";

import Header from "../components/Header";
import Rewards from "../components/Rewards";
import { Modal } from "react-bootstrap";
import close from "../assets/images/close.svg";
import { SqnetContractContext } from './../contexts/SqnetContractProvider';
import { Web3Context } from "../contexts/Web3Provider";
import { SqtContractContext } from './../contexts/SqtContractProvider';
import { toast } from "react-toastify";
import getBn from "../services/getBn";
import round from './../services/round';

const Home = () => {
  const [smShow, setSmShow] = useState(false);
  const [withdrawalEnabled, setWithdrawalEnabled] = useState(false);
  const { SqnetContract } = useContext(SqnetContractContext);
  const { SqtContract } = useContext(SqtContractContext);
  const [availableRewards, setAvailableRewards] = useState(0);
  const [lastClaim, setLastClaim] = useState(0);
  const { web3, accounts, activeWallet, initWeb3, handleDiconnect } = useContext(Web3Context);

  const [balance, setBalance] = useState(0);

  const claimRewards = async (token0, token1) => {
    if (withdrawalEnabled) {
      await SqnetContract.methods.claimRewards(token0, token1).send({ from: accounts[0] }).on('confirmation', () => {
        setWithdrawalEnabled(false);
      });
    } else {
      toast(<span>{Number(balance) === 0 ? 'No SQT balance available' : 'You can only claim once per 3 mins'}</span>);
    }
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
    async function getSqtReward() {
      const rewardWallet = await SqtContract.methods.rewardWallet().call();
      const userSqtBalance = getBn(await SqtContract.methods.balanceOf(accounts[0]).call());
      const totalSupply = getBn(await SqtContract.methods.totalSupply().call());
      const rewardBalanceSqtBefore = getBn(await SqtContract.methods.balanceOf(rewardWallet).call());
  
      const rewardPercentage = userSqtBalance.multipliedBy(getBn(100 * (10 ** 18))).dividedBy(totalSupply);
      const userReward = rewardBalanceSqtBefore.multipliedBy(rewardPercentage).dividedBy(getBn(100)).dividedBy(getBn(10 ** 18));
      return userReward;
    }

    const getAvailableRewards = async () => {
      const sqtRewards = await getSqtReward();
      const usdtRewards = await SqnetContract.methods.getAvailableUsdtRewards(sqtRewards.toFixed(0)).call({ from: accounts[0] });
      return usdtRewards;
    }

    function lastClaimBlockPassed() {
      return (Date.now() - (lastClaim * 1000)) / 60000 > 3;
    }
    async function init() {
      const balance = await SqtContract.methods.balanceOf(accounts[0]).call();

      setBalance(balance);
      const lastClaimResponse = await SqnetContract.methods.getLastClaim(accounts[0]).call();
      setWithdrawalEnabled(((Date.now() - (lastClaimResponse * 1000)) / 60000 > 3) && Number(balance) > 0);
      setLastClaim(lastClaimResponse);

      if (balance > 0) {
        const usdtRewards = await getAvailableRewards();
        const n = usdtRewards / 10 ** 18;
        setAvailableRewards(n < 1 ? round(n, 2) : n.toFixed(2));
      }
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

    const timer = setInterval(() => {
      if (lastClaimBlockPassed() && lastClaim > 0) {
        setWithdrawalEnabled(true);
        clearInterval(timer);
      }
    }, 10000);

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });

    return () => {
      clearInterval(timer);
    }
  }, [web3, initWeb3, SqtContract, SqnetContract, accounts, lastClaim]);

  return (
    <div className="container-fluid app-container">
      <Header
        accounts={accounts}
        disconnect={activeWallet === 'universal' ? () => disconnect() : () => handleDiconnect(() => setAvailableRewards(0))}
        setSmShow={setSmShow}
        balance={balance}
      />
      <Rewards withdrawalEnabled={withdrawalEnabled} userClaimRewards={claimRewards} availableRewards={availableRewards} />
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
