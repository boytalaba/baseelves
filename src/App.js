import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import { ethers } from "ethers";
import {
  HeroSection,
  AboutSection,
  FrequentlyAskedQuestions,
  Footer,
  MarqueeImage,
  Team,
  WalletInfo,
  HistorySection,
  MintSection,
} from "../src/style";

import Faq from "../src/components/FAQs";
import MarqueeNft from "../src/components/MarqueeNft";
import logo from "../src/assets/logo.png";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: #fff;
  font-weight: bold;
  color: #000;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click Mint Now to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = ethers.BigNumber.from(cost).mul(mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(blockchain.account, mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! `
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 50) {
      newMintAmount = 50;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <>
      <HeroSection>
        <div className="header">
          <div className="logo">
            <img src={logo} alt="" />
          </div>
          {/* <div className="icons">
            <a href="https://discord.gg/7AfjqZuwgG">
              <i className="fab fa-discord"></i>
            </a>
            <a href="https://twitter.com/metabulls_">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://www.instagram.com/BULLSNFT/">
              <i className="fab fa-instagram"></i>
            </a>
            {!wallet ? (
              <ConnectButton>Connect Wallet</ConnectButton>
            ) : wallet ? (
              <ConnectButton disabled>Wallet Connected</ConnectButton>
            ) : null}
          </div> */}
        </div>

        <div className="container">
          <div className="text">
            <h1>Base Elves NFTs</h1>
            <p>
              Base Elves NFT 
              launching on September 3 , 2023 on the Base blockchain
              for 0.003 ETH each!
            </p>


                
              <a href="https://www.twitter.com/baseelves">
              <button>Twitter</button>
            </a>

            <a href="https://t.me/baseelves">
              <button>Join Telegram</button>
            </a>
          </div>
          <div className="image">
            <div className="nft-image">
              <div className="title-container">
                <div className="title">
                  <h5>Base Elves</h5>
                  <p>
                    Price: <b>0.003 ETH </b>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HeroSection>

      <MintSection>
        <div className="connect">
          <h1>Wallet</h1>
          <s.SpacerSmall />
          {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
            <>
              <p style={{ color: "var(--accent-text)" }}>The sale has ended.</p>
              <p style={{ color: "var(--accent-text)" }}>
                You can still find {CONFIG.NFT_NAME} on
              </p>
            </>
          ) : (
            <>
              {blockchain.account === "" ||
              blockchain.smartContract === null ? (
                <div>
                  <p
                    style={{
                      color: "var(--accent-text)",
                    }}
                  >
                    Connect to the {CONFIG.NETWORK.NAME} network
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(connect());
                      getData();
                    }}
                  >
                    Connect Wallet
                  </button>
                  {blockchain.errorMsg !== "" ? (
                    <>
                      <p
                        style={{
                          color: "var(--accent-text)",
                        }}
                      >
                        {blockchain.errorMsg}
                      </p>
                    </>
                  ) : null}
                </div>
              ) : (
                <>
                  <p
                    style={{
                      color: "var(--accent-text)",
                    }}
                  >
                    {feedback}
                  </p>
                  <div className="increasement">
                    <button
                      style={{ lineHeight: 0.4 }}
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        decrementMintAmount();
                      }}
                    >
                      -
                    </button>
                    <s.SpacerMedium />
                    <p
                      style={{
                        color: "var(--accent-text)",
                      }}
                    >
                      {mintAmount}
                    </p>
                    <button
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        incrementMintAmount();
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div>
                    <button
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        claimNFTs();
                        getData();
                      }}
                    >
                      {claimingNft ? "Minting" : "Mint Now"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="detail">
          <h1>
            {data.totalSupply} / {CONFIG.MAX_SUPPLY}
          </h1>
          <s.SpacerSmall />

          <p style={{ color: "var(--accent-text)" }}>
            1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
            {CONFIG.NETWORK.SYMBOL}.
          </p>
          <button
            onClick={(e) => {
              window.open(CONFIG.MARKETPLACE_LINK, "_blank");
            }}
          >
            {CONFIG.MARKETPLACE}
          </button>
        </div>
      </MintSection>

      <MarqueeImage>
        <MarqueeNft />
      </MarqueeImage>

      <AboutSection>
        <h1>About</h1>
        

        <p>
          You are welcome to explore Base Elves NFTs, which are digitally altered
          pieces of masterful arts. By placing the subjects of these
          arts in new digitally imagined environments, we have given more
          room to the expression of the different realities of our Base Chain Experience.
        </p>

        <p>
          We also intends on building the largest NFT Community out of Base chain,
          which leads on to a metaverse where creatives can express, explore,
          and interact with each other’s creations. 
        </p>
      </AboutSection>

      <HistorySection>
        <h1>The Base Elves</h1>

        

        <p>
          Long time ago, about 1 million years ago, before iPhones, CZ, Elon Musk, Justin Suns, and the like, humans, elves, and other species lived in peace and harmony in a land called Velleity. Everyone was happy and complimented each other's weaknesses and strengths. Unity, respect, and loyalty are practiced. Until one day, depletion of resources came. A great war broke out for these resources and devastated the land of Velleity. These events caused injury, death, and the extinction of species. The land was not what it was before; toxic chemicals and radiation were all over the land, making it impossible to inhabit. 500,000 years after the war had passed, we all thought no one had survived. A new dawn rose, and a new breed of elves came out of caves and shelters. These species are not what they were before; they are now stronger, brighter, and based. -- BASED ELVES

        </p>
      </HistorySection>

    

      <FrequentlyAskedQuestions>
        <h1>FAQs</h1>
        <Faq />
      </FrequentlyAskedQuestions>

      <Footer>
        <div className="text">
          <p>
            Copyright © 2023 Base Elves
            <br />
            All rights reserved
          </p>
        </div>


        <div className="logo">
          <img src={logo} alt="" />
        </div>
      </Footer>
    </>
  );
}

export default App;
