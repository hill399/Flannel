const Oracle = artifacts.require('Oracle');
const Flannel = artifacts.require('Flannel');
const TestnetConsumer = artifacts.require('TestnetConsumer')
const LinkToken = artifacts.require('LinkTokenInterface')

const unlockedTestAccount = '0x1A4A8483564e7d1Be536cDc39B3958b79F6F7015'

const stdLinkTokenRopsten = '0x20fe562d797a42dcb3399062ae9546cd06f63280'
const aaveLinkTokenRopsten = '0x1a906E71FF9e28d8E01460639EB8CF0a6f0e2486'

module.exports = async callback => {
  const stdLinkToken = await LinkToken.at(stdLinkTokenRopsten);
  const aaveLinkToken = await LinkToken.at(aaveLinkTokenRopsten);

  const oracle = await Oracle.deployed();
  const testnetConsumer = await TestnetConsumer.deployed();
  const flannel = await Flannel.deployed();

  console.log('Starting Prep...');
  console.log(`Transferring 2 LINK to TestnetConsumer...`);
  linktx = await stdLinkToken.transfer(testnetConsumer.address, `${2e18}`, {from: unlockedTestAccount})
  console.log(`Succeeded txid: ${linktx.tx}`);
  balanceTc = await stdLinkToken.balanceOf.call(testnetConsumer.address);
  console.log (`LINK Balance of TestnetConsumer: ${balanceTc}`);

  console.log(`Transferring 2 Aave LINK to Flannel...`);
  alinktx = await aaveLinkToken.transfer(flannel.address, `${2e18}`, {from: unlockedTestAccount})
  console.log(`Succeeded txid: ${alinktx.tx}`);
  balanceFl = await stdLinkToken.balanceOf.call(testnetConsumer.address);
  console.log (`Aave LINK Balance of Flannel: ${balanceFl}`);

  console.log(`Transferring ownership of oracle contract to Flannel...`);
  oracletx = await oracle.transferOwnership(flannel.address);
  console.log(`Succeeded txid: ${oracletx.tx}`);

  callback();
}

