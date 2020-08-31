// test-environment.config.js

const { config } = require("./config.js");

var key = config.INFURA_API_KEY;

module.exports = {
 accounts: {
   amount: 10, // Number of unlocked accounts
   ether: 100, // Initial balance of unlocked accounts (in ether)
 },

 contracts: {
   type: 'truffle', // Contract abstraction to use: 'truffle' for @truffle/contract or 'web3' for web3-eth-contract
   defaultGas: 6e6, // Maximum gas for contract calls (when unspecified)

   // Options available since v0.1.2
   defaultGasPrice: 20e9, // Gas price for contract calls (when unspecified)
   artifactsDir: 'build/contracts', // Directory where contract artifacts are stored
 },

 node: { // Options passed directly to Ganache client
   gasLimit: 8e6, // Maximum gas per block
   gasPrice: 20e9, // Sets the default gas price for transactions if not otherwise specified.
   fork: 'https://mainnet.infura.io/v3/' + key, // An url to Ethereum node to use as a source for a fork
   unlocked_accounts: ['0xA25e31D8e4ED3e959898a089Dc2624F14a7fB738','0x7A74Fb6BD364b9b5ef69605a3D28327dA8087AA0','0x5152dD5a3e6aB6bc421DA90066BF0bAF58aa50bD'], // Array of addresses specifying which accounts should be unlocked.
 },
};
