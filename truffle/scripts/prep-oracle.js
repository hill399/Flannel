const Oracle = artifacts.require('Oracle');
const Flannel = artifacts.require('Flannel');
const LinkToken = artifacts.require('LinkToken');
const Consumer = artifacts.require('TestnetConsumer');

module.exports = async callback => {
  const oracle = await Oracle.deployed();
  const flannel = await Flannel.deployed();
  const linkToken = await LinkToken.deployed();
  const consumer = await Consumer.deployed();

  console.log(`Transfering 100 LINK to consumer address  ${Consumer.address}...`);
  const txTransfer = await linkToken.transfer(Consumer.address, `${100e18}`);
  console.log(`Transfer succeeded! Transaction ID: ${txTransfer.tx}.`);

  await oracle.transferOwnership(Flannel.address);
  console.log(`Ownership of oracle transferred to flannel at ${Flannel.address}.`);
  
  callback();
}
