const Oracle = artifacts.require('Oracle');
const Flannel = artifacts.require('Flannel');
const LinkToken = artifacts.require('LinkToken');

module.exports = async callback => {
  const oracle = await Oracle.deployed();
  const flannel = await Flannel.deployed();
  const linkToken = await LinkToken.deployed();

  console.log(`Transfering 100 LINK to ${Oracle.address}...`);
  const txTransfer = await linkToken.transfer(Oracle.address, `${100e18}`);
  console.log(`Transfer succeeded! Transaction ID: ${txTransfer.tx}.`);

  await oracle.transferOwnership(Flannel.address);
  console.log(`Ownership of oracle transferred to flannel at ${Flannel.address}.`);
  
  callback();
}
