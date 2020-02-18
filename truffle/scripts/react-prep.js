const h = require('chainlink-test-helpers')

const Oracle = artifacts.require('Oracle');
const Flannel = artifacts.require('Flannel');
const TestnetConsumer = artifacts.require('TestnetConsumer')
const LinkToken = artifacts.require('LinkTokenInterface')
const UniswapInterface = artifacts.require('UniswapExchangeInterface')
const AaveLendingInterface = artifacts.require('LendingPool')
const AToken = artifacts.require('AToken')

const unlockedTestAccount = '0x1A4A8483564e7d1Be536cDc39B3958b79F6F7015'

const uniswapRopsten = '0x4426F644f5999Aef8A7d87F0Af6e0755E94a2588'
const stdLinkTokenRopsten = '0x20fe562d797a42dcb3399062ae9546cd06f63280'
const aaveLinkTokenRopsten = '0x1a906E71FF9e28d8E01460639EB8CF0a6f0e2486'
const aaveApprovalRopsten = '0x4295Ee704716950A4dE7438086d6f0FBC0BA9472'
const aaveLendingPoolRopsten = '0x9E5C7835E4b13368fd628196C4f1c6cEc89673Fa'
const aLinkInterestToken = '0x52fd99c15e6FFf8D4CF1B83b2263a501FDd78973'

const jobId = '4c7b7ffb66b344fbaa64995af81e355a'
const dummyResponse = web3.utils.numberToHex('12345');

module.exports = async callback => {

  const accounts = await web3.eth.getAccounts();

  const owner = accounts[0]
  const oracleNode = accounts[1]

  console.log("Starting React Prep...");
  const stdLinkToken = await LinkToken.at(stdLinkTokenRopsten);
  const aaveLinkToken = await LinkToken.at(aaveLinkTokenRopsten);
  const uniswap = await UniswapInterface.at(uniswapRopsten);
  const lendingPool = await AaveLendingInterface.at(aaveLendingPoolRopsten);
  const aLinkIntToken = await AToken.at(aLinkInterestToken);

  console.log("Ropsten Contracts Set...");

  const oracle = await Oracle.deployed();
  const testnetConsumer = await TestnetConsumer.deployed();
  const flannel = await Flannel.deployed();

  console.log("Local Contracts Deployed...");

  await flannel.configureOracleSetup(oracle.address, oracleNode, {from : owner});
  console.log("Oracle Configured...");
  
  await oracle.setFulfillmentPermission(oracleNode, true, { from: owner })
  await oracle.transferOwnership(flannel.address, { from: owner })
  console.log("Ownership Transferred...");

  await stdLinkToken.transfer(testnetConsumer.address, `${25e18}`, {from: unlockedTestAccount})
  await aaveLinkToken.transfer(flannel.address, `${25e18}`, {from: unlockedTestAccount})
  console.log("25 Test LINK Transferred...");

  let i;
  for (i = 0; i < 5; i++) {
    tx = await testnetConsumer.requestEthereumPrice(oracle.address, jobId)
    request = h.decodeRunRequest(tx.receipt.rawLogs[3])
    await h.fulfillOracleRequest(oracle, request, dummyResponse, { from: oracleNode })
    console.log(`Oracle Requests ${i} Made...`);
  }

  callback();
}

