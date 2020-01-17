module.exports = {
  networks: {
    ganache: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "*",
     gas: 4612388,
    },
  },
  compilers: {
    solc: {
       settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200
        },
       },
      version: "0.4.24",
    }
  }
}
