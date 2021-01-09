// test-environment.config.js

const { config } = require("./config.js");

var key = config.INFURA_API_KEY;

module.exports = {
 accounts: {
   amount: 400, // Number of unlocked accounts
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
   unlocked_accounts: ['0xA25e31D8e4ED3e959898a089Dc2624F14a7fB738','0x1eaD7050c94C8A1f08071ddBb28b01b3eB1B3D38','0xF3d18dB1B4900bAd51b6106F757515d1650A5894', '0xa6055F63ea1Cf238e6FD00e4D3810141ebF3ec2D', '0x6a3000945173AD8905C70FdA700EbBE1C41EAB40'], // Array of addresses specifying which accounts should be unlocked.
 },
};
