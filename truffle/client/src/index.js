import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Web3 from "web3";

import 'bootstrap/dist/css/bootstrap.min.css';

import { Drizzle, generateStore } from "drizzle";
import { DrizzleContext } from "drizzle-react";

import Flannel from "./contracts/Flannel.json";
import LinkTokenInterface from "./contracts/LinkTokenInterface.json"
import AToken from "./contracts/AToken.json"
import Oracle from "./contracts/Oracle.json"

//const web3 = new Web3();
const web3 = new Web3("http://127.0.0.1:7545");

const options = {
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:7545",
    },
  },
  contracts: [Flannel, Oracle,
    {
      contractName: LinkTokenInterface.contractName,
      web3Contract: new web3.eth.Contract(LinkTokenInterface.abi, '0x20fe562d797a42dcb3399062ae9546cd06f63280')
    },
    {
      contractName: "AaveLinkTokenInterface",
      web3Contract: new web3.eth.Contract(LinkTokenInterface.abi, '0x1a906E71FF9e28d8E01460639EB8CF0a6f0e2486')
    },
    {
      contractName: AToken.contractName,
      web3Contract: new web3.eth.Contract(AToken.abi, '0x52fd99c15e6FFf8D4CF1B83b2263a501FDd78973')
    }],
  polls: {
    accounts: 3000,
    contracts: 3000
  },
};

const drizzleStore = generateStore(options);

const drizzle = new Drizzle(options, drizzleStore);

ReactDOM.render(
  <DrizzleContext.Provider drizzle={drizzle}>
    <App />
  </DrizzleContext.Provider>,
  document.getElementById('root'));