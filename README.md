
# Flannel
## Chainlink oracle extension interface.
- Currently in development, for Ropsten use only.
- PoC available, please treat as such.

## Overview

Front-End demo available at [flannel.link](https://flannel.link)

Flannel is a smart contract which acts a a management interface for a node operators oracle contract. Controlled by function calls from the user's node, Flannel can provide the following features:

- [X] Withdraw earned LINK from oracle contract at given threshold levels.
- [X] Top-up the users node address with ETH - converting withdrawn LINK to ETH via Uniswap.
- [X] Option to deposit LINK into the Aave lending pool and earn interest.
- [X] Front-end management interface for configuration.
- [X] Live PoC available
- [ ] Extended testnet operation.

### Automate
Use your chainlink node to trigger Flannel and automate withdrawals, node top-ups and DeFi saving. Template job specification available (node_job.json) to trigger operation at a fixed time interval.

### Withdraw
Withdraw earned LINK from the deployed Oracle contract to make better use of idle funds. Funds are split and allocated into three seperate function pools, which can then by used by Flannel functions.

### Top-Up
Keep your Chainlink node topped up with earned LINK funds converting to Ether via Uniswap pools. Manually set the given amount of LINK to convert, or automate top-ups by specifying the nodes trigger threshold (in ETH) and a given number of LINK tokens to top-up by.

### Earn
Deposit earned funds into the Aave network to mint interest-bearing aLINK tokens and store within Flannel - with returns dependant on Aave's variable APR at the time. Deposits can be both manual and automated, with aLink token burns a manual process only.

### Store
Stored funds remain idle in the Flannel contract, and can be easily withdrawn by the user or rebalanced into other function pools.


## Getting started

1. Set up Chainlink node as per the [offical documentation](https://docs.chain.link/docs/node-operator-overview)
2. Clone the Flannel repo and run the following:
```
npm install
npm run remix
```
3. Visit [Remix](https://remix.ethereum.org/#optimize=false&evmVersion=null&version=soljson-v0.5.12+commit.7709ece9.js&appVersion=0.7.7) and connect to localhost instance.
4. Navigate to localhost/truffle/contracts/Flannel.sol and compile.
5. Add the following as a constructor, and deploy:
```
Constructor Arguments
---------------
    address _uniswapExchange - Fixed @ "0x4426F644f5999Aef8A7d87F0Af6e0755E94a2588"
    address _stdLinkToken - Fixed @ "0x20fe562d797a42dcb3399062ae9546cd06f63280"
    address _aaveLinkToken - Fixed @ "0x1a906E71FF9e28d8E01460639EB8CF0a6f0e2486"
    address _aLinkToken - Fixed @ "0x52fd99c15e6FFf8D4CF1B83b2263a501FDd78973"
    address _oracle - User Configurable @ Deployed Oracle.sol address
    address _linkNode - User Configurable @ Deployed Chainlink node address
    address _lendingPool - Fixed @ "0x9E5C7835E4b13368fd628196C4f1c6cEc89673Fa"
    address _lendingPoolApproval - Fixed @ "0x4295Ee704716950A4dE7438086d6f0FBC0BA9472"

Constructor Template
-----------------
"0x4426F644f5999Aef8A7d87F0Af6e0755E94a2588", "0x20fe562d797a42dcb3399062ae9546cd06f63280", "0x1a906E71FF9e28d8E01460639EB8CF0a6f0e2486", "0x52fd99c15e6FFf8D4CF1B83b2263a501FDd78973", 
"ADD_ORACLE_ADDRESS_HERE", "ADD LINK_NODE_ADDRESS_HERE",
"0x9E5C7835E4b13368fd628196C4f1c6cEc89673Fa", "0x4295Ee704716950A4dE7438086d6f0FBC0BA9472"

```
6. Transfer ownership of deployed oracle contract to deployed Flannel contract.
7. Automation Only - Create job on Chainlink node using external initiator of choice (example is cron-based) and configure EthTx as based in the example (node_job.json).
8. Visit [flannel.link](https://flannel.link), enter deployed Flannel address (or view demo) to access front-end.

NOTE: On Ropsten, the Aave network uses their own flavour of LINK token. The Flannel contract has been configured to accomodate this, but requires a balance of this Aave link to operate correctly. Aave LINk can be found at the testnet page [HERE](https://testnet.aave.com/)



## Test

Local testing currently available for Oracle and Flannel triggering. Clone repo then run:

```
ganache-cli --fork https://ropsten.infura.io/v3/{Project-ID}@{latest-block-no} -u 0x1A4A8483564e7d1Be536cDc39B3958b79F6F7015 -p 8545
npm install
npm test
```
