[![#ubuntu 18.04](https://img.shields.io/badge/ubuntu-v18.04-orange?style=plastic)](https://ubuntu.com/download/desktop)
[![#npm 13.13.0](https://img.shields.io/badge/npm-v13.13.0-blue?style=plastic)](https://github.com/nvm-sh/nvm#installation-and-update)
[![#built_with_Truffle](https://img.shields.io/badge/built%20with-Truffle-blueviolet?style=plastic)](https://www.trufflesuite.com/)
[![#solc 0.6.8](https://img.shields.io/badge/solc-v0.6.8-brown?style=plastic)](https://github.com/ethereum/solidity/releases/tag/v0.6.8)
[![#testnet kovan](https://img.shields.io/badge/testnet-Kovan-purple?style=plastic&logo=Ethereum)]()

# InsigniaDAO

> Non-transferable Badges for Maker Ecosystem Activity, [issue #537](https://github.com/makerdao/community/issues/537)


## Mentors
- Mariano Conti, [@nanexcool](https://github.com/nanexcool)
- Josh Crites, [@critesjosh](https://github.com/critesjosh)
- Yannis Stamelakos, [@i-stam](https://github.com/i-stam)
- Dror Tirosh (OpenGSN), [@drortirosh](https://github.com/drortirosh)

## Sections
* [Building Blocks](#building-blocks)
* [Setup](#setup)
* [Deploy](#deploy)
* [About](#about)

## Building Blocks

### [InsigniaDAO](./contracts/InsigniaDAO.sol)
> InsigniaDAO to check for activities on MakerDAO ecosystem and keep track of redeemers

To enable InsigniaDAO to check on-chain for activities on MakerDAO ecosystem we are using three interface to map the functions that we'll use:
- **PotLike**: to check if a user has accrued 1 or more Dai from DSR, via **pie(address guy)**, **chi()**, **rho()** and **drip()** used in the internal function **_dai(address guy)** to return the **wad** or the current accrued Dai interest in DSR.
- **DSChief**: to check if a user is voting on a Governance Poll via **votes(address)** a getter function to check who is currently voting.
- **Flipper**: to check for high bidder in the current Bid in Collateral Auctions via **bids(id)** a getter function of current Bid on Flipper to check for **bids(id).guy** the high bidder.

The function **checkRedeemer(uint id)** will check on-chain for the previous activities on MakerDAO and will store the hash of the caller address, casted in address type, into the OpenZeppelin EnumerableSet.AddressSet **redeemers** that will be verified in BadgeFactory via **verify(address guy)** function linked to it, to allow a redeemer to activate a Non-transferable Badge.

InsigniaDAO, let the owner to set (via **setRootHashes(bytes[]) memory rootHashes**) an array of root hashes, called **roots**, ordered by template Id to allow redemeers checked off-chain for activities via TheGraph on the front-end, and stored into a Merkle Tree, to activate Badge.
The getter function **roots(uint templateId)** is then linked to BadgeFactory and checked via OpenZeppelin MerkleProof.sol **verify()** function.

The contract also inherites OpenZeppelic AccessControl.sol to set the Pauser role to the owner of the contract that can **pause()**, **unpause()** functions in case of emergency (Circuit Breaker Design Pattern).

### [BadgeRoles](./contracts/BadgeRoles.sol)
> BadgeRoles Access Management for Default Admin, Templater and Pauser Role

BadgeRoles inherites the OpenZeppelin AccessControl.sol, allowing the owner of the contract to be set as Default Admin, Pauser and also as Templater and to add a Templater via **addTemplater(address guy)**.

### [BadgeFactory](./contracts/BadgeFactory.sol)
> BadgeFactory to manage Templates and activate Non-transferable Badges for redeemers
 
To enable BadgeFactory to verify redeemers checked on-chain/off-chain for activities on MakerDAO ecosystem, when they try to redeem their Badge, we're using the interface InsigniaDAO to map the function we'll use.  

In particular, we'll use:
- **verify(address guy)** to verify redeemers checked on-chain.
- **roots(uint templateId)** a getter function to return root by templated Id to be verified via MerkleProof.sol **verify()** function, allowing redeemers checked off-chain and stored into a Merkle Tree to be able to redeem Badges.  

A Merkle Tree is generated for every Template and the root hash is updated by owner of InsigniaDAO daily to allow batches of redeemers to be checked and to redeem Badges.


Setup
============

Clone this GitHub repository.

# Steps to compile and test

  - Local dependencies:
    - Truffle
    - Ganache CLI
    - OpenZeppelin Contracts v3.0.1
    - Truffle-Flattener
    ```sh
    $ npm i
    ```
  - Global dependencies:
    - MythX CLI (optional):
    ```sh
    $ git clone git://github.com/dmuhs/mythx-cli
    $ sudo python setup.py install
    ```
## Running the project with local test network (ganache-cli)

   - Start ganache-cli with the following command:
     ```sh
     $ ganache-cli
     ```
   - Compile the smart contract using Truffle with the following command:
     ```sh
     $ truffle compile
     ```
   - Deploy the smart contracts using Truffle & Ganache with the following command:
     ```sh
     $ truffle migrate
     ```
   - Test the smart contracts using Truffle & Ganache with the following command:
     ```sh
     $ truffle test
     ```
   - Analyze the smart contracts using MythX CLI with the following command (optional):
     ```sh
     $ mythx analyze
     ```
## MythX CLI Report
Contract | Line | SWC Title | Severity | Short Description 
--- | --- | --- | --- | ---
InsigniaDAO.sol | 80 | Timestamp Dependence | Low | A control flow decision is made based on The block.timestamp environment variable.

Deploy
============
## Deploy on Kovan Testnet
 - Get an Ethereum Account on Metamask.
 - On the landing page, click “Get Chrome Extension.”
 - Create a .secret file cointaining the menomic.
 - Get some test ether from a [Kovan's faucet](https://faucet.kovan.network/).
 - Signup [Infura](https://infura.io/).
 - Create new project.
 - Copy the rinkeby URL into truffle-config.js.
 - Uncomment the following lines in truffle-config.js:
   ```
   // const HDWalletProvider = require("@truffle/hdwallet-provider");
   // const infuraKey = '...';
   // const infuraURL = 'https://kovan.infura.io/...';

   // const fs = require('fs');
   // const mnemonic = fs.readFileSync(".secret").toString().trim();
   ```
 - Install Truffle HD Wallet Provider:
   ```sh
   $ npm install @truffle/hdwallet-provider
   ```
 - Deploy the smart contract using Truffle & Infura with the following command:
   ```sh
   $ truffle migrate --network kovan
   ```

## Project deployed on Kovan
[InsigniaDAO.sol](https://kovan.etherscan.io/address/0x7Cf0ef375998470D75044B10Cf2f6a5F8af34a20)  
[BadgeFactory.sol](https://kovan.etherscan.io/address/0x276C2c2CF6F751D62C79c6C1693666D87B015B17)

About
============
## Inspiration & References

- [open-proofs](https://github.com/rrecuero/open-proofs)
- [ERC1238](https://github.com/ethereum/EIPs/issues/1238)
- [ERC721](https://eips.ethereum.org/EIPS/eip-721)
- [POAP](https://www.poap.xyz/)
- [MakerDAO](https://makerdao.com/en/)
- [Chai](https://chai.money/about.html)

## Authors

Project created by [Nazzareno Massari](https://www.nazzarenomassari.com), Scott Herren in collaboration with Bryan Flynn.  
Team MetaBadges from HackMoney ETHGlobal Virtual Hackathon.
