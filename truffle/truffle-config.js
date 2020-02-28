const path = require("path");

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),

  plugins: [ "truffle-security" ],
  
  networks: {
    ganache: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*",
     gas: 4612388,
     skipDryRun: true,
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
      version: "0.5.12",
    }
  }
}
