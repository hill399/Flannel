const fs = require('fs');
const path = require('path');

const LinkToken = artifacts.require('LinkToken');
const Oracle = artifacts.require('Oracle');
const Flannel = artifacts.require('Flannel');

/* Dummy for uniswap until suitable test can be defined - local deployment (?) */
const addressDummy = '0x0000000000000000000000000000000000000000';
const userThreshold = 10e18;

module.exports = async (deployer, accounts) => {
  const linkToken = await deployer.deploy(LinkToken);
  const oracle = await deployer.deploy(Oracle, LinkToken.address);
  await deployer.deploy(Flannel, addressDummy, LinkToken.address, addressDummy, Oracle.address, userThreshold.toString());
};

