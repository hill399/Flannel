const truffleAssert = require('truffle-assertions');
const h = require('chainlink-test-helpers')

contract('Flannel', accounts => {
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

  const owner = accounts[0]
  const oracleNode = accounts[1]
  const stranger = accounts[2]

  const userThreshold = web3.utils.toWei('1', 'ether');

  const jobId = '4c7b7ffb66b344fbaa64995af81e355a'
  const dummyResponse = web3.utils.numberToHex('12345');
  const costOfReq = (web3.utils.toWei('5', 'ether'));

  let stdLinkToken, aaveLinkToken, uniswap, lendingPool, oracle, testnetConsumer, flannel

  beforeEach(async () => {
    stdLinkToken = await LinkToken.at(stdLinkTokenRopsten);
    aaveLinkToken = await LinkToken.at(aaveLinkTokenRopsten);
    uniswap = await UniswapInterface.at(uniswapRopsten);
    lendingPool = await AaveLendingInterface.at(aaveLendingPoolRopsten);
    aLinkIntToken = await AToken.at(aLinkInterestToken);

    oracle = await Oracle.new(stdLinkToken.address);
    testnetConsumer = await TestnetConsumer.new(stdLinkToken.address);
    flannel = await Flannel.new(uniswap.address, stdLinkToken.address, aaveLinkToken.address, aLinkIntToken.address, oracle.address, oracleNode, lendingPool.address, aaveApprovalRopsten, userThreshold.toString());

    await flannel.configureOracleSetup(oracle.address, oracleNode);

    await oracle.setFulfillmentPermission(oracleNode, true, { from: owner })
    await oracle.transferOwnership(flannel.address, { from: owner })

    await stdLinkToken.transfer(testnetConsumer.address, `${5e18}`, {from: unlockedTestAccount})
    await aaveLinkToken.transfer(flannel.address, `${5e18}`, {from: unlockedTestAccount})

    tx = await testnetConsumer.requestEthereumPrice(oracle.address, jobId)
    request = h.decodeRunRequest(tx.receipt.rawLogs[3])
    await h.fulfillOracleRequest(oracle, request, dummyResponse, { from: oracleNode })
  })

  context('Flannel - Oracle Functions', () => {
    it('Flannel can withdraw LINK from the oracle contract', async () => {
      await flannel.withdrawFromOracle({from: oracleNode});
      nb = await stdLinkToken.balanceOf.call(flannel.address);
      assert.equal(Number(nb), costOfReq, "LINK has not been successfully withdrawn from oracle");
    })

    it('Only owner can revert ownership of oracle contract from Flannel', async() => {
      await truffleAssert.reverts(
        flannel.revertOracleOwnership({from: stranger}),
        "VM Exception while processing transaction: revert");
      await truffleAssert.reverts(
        flannel.revertOracleOwnership({from: oracleNode}),
        "VM Exception while processing transaction: revert");  
      await flannel.revertOracleOwnership({from: owner});
    })
  })

  context('Flannel - Uniswap Functions', () => {
    it('Flannel can convert LINK funds to eth and transfer to node', async () => {
      await flannel.withdrawFromOracle({from: oracleNode});
      ob = await web3.eth.getBalance(oracleNode);
      await flannel.linkToEthTopUp({from: oracleNode});
      nb = await web3.eth.getBalance(oracleNode);
      assert.notEqual(Number(nb), Number(ob), "Uniswap transaction has not been successful");
    })
  })

  context('Flannel - Aave Functions', () => {
    it('Flannel can deposit aaveLINK into Aave and redeem aLINK', async() => {
      await flannel.withdrawFromOracle({from: oracleNode});
      ob = await aaveLinkToken.balanceOf.call(flannel.address);
      await flannel.depositToAave({from: oracleNode});
      nb = await aaveLinkToken.balanceOf.call(flannel.address);
      diff = ob - nb;
      alinkb = await aLinkIntToken.balanceOf.call(flannel.address);
      assert.notEqual(Number(nb), Number(ob), "Aave deposit has not been successful");
      assert.equal(diff, alinkb, "aLINK has not been deposited");
    })

    it('Flannel can withdraw deposited aaveLink from Aave', async() => {
      await flannel.withdrawFromOracle({from: oracleNode});
      await flannel.depositToAave({from: oracleNode});
      ob = await aLinkIntToken.balanceOf.call(flannel.address);
      await flannel.withdrawFromAave({from: oracleNode});
      nb = await aLinkIntToken.balanceOf.call(flannel.address);
      assert.notEqual(Number(nb), Number(ob), "Aave withdrawal has not been successful");
    })
  })

})
