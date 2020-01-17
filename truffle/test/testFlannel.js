const truffleAssert = require('truffle-assertions');
const h = require('chainlink-test-helpers')

contract('LinkedBtc', accounts => {
  const LinkToken = artifacts.require('LinkToken')
  const Oracle = artifacts.require('Oracle')
  const Flannel = artifacts.require('Flannel')
  const Consumer = artifacts.require('TestnetConsumer')

  const owner = accounts[0]
  const oracleNode = accounts[1]

  // Represents 1 LINK for testnet requests
  const payment = web3.utils.toWei('1')

  /* Dummy for uniswap until suitable test can be defined - local deployment (?) */
  const addressDummy = '0x0000000000000000000000000000000000000000';
  const userThreshold = web3.utils.toWei('1', 'ether')
  const newLinkInstance = web3.utils.toWei('100', 'ether')

  const jobId = '4c7b7ffb66b344fbaa64995af81e355a'
  const dummyResponse = web3.utils.numberToHex('12345');
  const costOfReq = web3.utils.toWei('1', 'ether')

  beforeEach(async () => {
    link = await LinkToken.new()
    oc = await Oracle.new(link.address, { from: owner})
    fc = await Flannel.new(addressDummy, link.address, oracleNode, oc.address, userThreshold.toString())
    cc = await Consumer.new(link.address)

    await oc.setFulfillmentPermission(oracleNode, true, { from: owner })
    await oc.transferOwnership(fc.address, { from: owner })

    await link.transfer(cc.address, newLinkInstance)

    tx = await cc.requestEthereumPrice(oc.address, jobId)
    request = h.decodeRunRequest(tx.receipt.rawLogs[3])
    await h.fulfillOracleRequest(oc, request, dummyResponse, { from: oracleNode })
  })

  context('Flannel - Oracle Functions', () => {
    it('Flannel can withdraw LINK from the oracle contract', async () => {
      ob = await link.balanceOf(oc.address)
      await fc.withdrawFromOracle({from: oracleNode})
      nb = await link.balanceOf(fc.address)
      assert.equal(Number(nb), costOfReq, "LINK has not been successfully withdrawn from oracle");
    })
  })
})
