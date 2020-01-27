const Oracle = artifacts.require('Oracle');
const Flannel = artifacts.require('Flannel');
const TestnetConsumer = artifacts.require('TestnetConsumer')
const LinkToken = artifacts.require('LinkTokenInterface')
const UniswapInterface = artifacts.require('UniswapExchangeInterface')
const AaveLendingInterface = artifacts.require('LendingPool')
const AToken = artifacts.require('AToken')

const uniswapRopsten = '0x4426F644f5999Aef8A7d87F0Af6e0755E94a2588'
const addressDummy = '0x0000000000000000000000000000000000000000'

const stdLinkTokenRopsten = '0x20fe562d797a42dcb3399062ae9546cd06f63280'

const aaveLinkTokenRopsten = '0x1a906E71FF9e28d8E01460639EB8CF0a6f0e2486'
const aaveApprovalRopsten = '0x4295Ee704716950A4dE7438086d6f0FBC0BA9472'
const aaveLendingPoolRopsten = '0x9E5C7835E4b13368fd628196C4f1c6cEc89673Fa'
const aLinkTokenRopsten = '0x52fd99c15e6FFf8D4CF1B83b2263a501FDd78973'

module.exports = async (deployer) => {
  const stdLinkToken = await LinkToken.at(stdLinkTokenRopsten);
  const aaveLinkToken = await LinkToken.at(aaveLinkTokenRopsten);
  const aLinkToken = await AToken.at(aLinkTokenRopsten);
  const lendingPool = await AaveLendingInterface.at(aaveLendingPoolRopsten);
  const uniswap = await UniswapInterface.at(uniswapRopsten);

  const oracle = await deployer.deploy(Oracle, stdLinkToken.address);
  await deployer.deploy(TestnetConsumer, stdLinkToken.address);
  await deployer.deploy(Flannel, uniswap.address, stdLinkToken.address, aaveLinkToken.address, aLinkToken.address, oracle.address, addressDummy, lendingPool.address, aaveApprovalRopsten);
};

/*
    constructor
    (
    address _uniswapExchange,
    address _stdLinkToken,
    address _aaveLinkToken,
    address _linkNode,
    address _oracle,
    address _linkNode,
    address _lendingPool,
    address _lendingPoolApproval
    )
*/
