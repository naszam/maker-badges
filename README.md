[![#ubuntu 20.04](https://img.shields.io/badge/ubuntu-v20.04-orange?style=plastic)](https://ubuntu.com/download/desktop)
[![#node 12](https://img.shields.io/badge/node-v12-blue?style=plastic)](https://github.com/nvm-sh/nvm#installation-and-update)
[![built-with openzeppelin](https://img.shields.io/badge/built%20with-OpenZeppelin-3677FF?style=plastic)](https://docs.openzeppelin.com/)
[![#solc 0.6.12](https://img.shields.io/badge/solc-v0.6.12-brown?style=plastic)](https://github.com/ethereum/solidity/releases/tag/v0.6.12)
[![#testnet sokol](https://img.shields.io/badge/testnet-Sokol-grey?style=plastic&logo=Ethereum)](#development-deployments)

[![Lint](https://github.com/naszam/maker-badges/actions/workflows/lint.yml/badge.svg)](https://github.com/naszam/maker-badges/actions/workflows/lint.yml)
[![Tests](https://github.com/naszam/maker-badges/actions/workflows/tests.yml/badge.svg)](https://github.com/naszam/maker-badges/actions/workflows/tests.yml)
[![Fuzz](https://github.com/naszam/maker-badges/actions/workflows/fuzz.yml/badge.svg)](https://github.com/naszam/maker-badges/actions/workflows/fuzz.yml)

[![#ETHGlobal HackMoney](https://img.shields.io/badge/ETHGlobal-HackMoney-blueviolet?style=for-the-badge&logo=atom&labelColor=5fc5a6)](https://hackathon.money/)

<img src="Badges.png" width="30%">

# Maker Badges

> Non-transferable Badges for Maker Ecosystem Activity

An incentive protocol to enhance activity on MakerDAO Ecosystem

## Mentors

- Mariano Conti, [@nanexcool](https://github.com/nanexcool)
- Josh Crites, [@critesjosh](https://github.com/critesjosh)
- Yannis Stamelakos, [@i-stam](https://github.com/i-stam)
- Dror Tirosh (OpenGSN), [@drortirosh](https://github.com/drortirosh)

[Demo](https://youtu.be/oZhXjtDnKBM)  
[HackMoney](https://hack.ethglobal.co/showcase/metabadges-recJS9yRU2zu4rksZ)

## Sections

- [Building Blocks](#building-blocks)
- [Setup](#setup)
- [Deploy](#deploy)
- [Interface](#interface)
- [Backend](#backend)
- [About](#about)

# Building Blocks

![Smart Contracts Flow-Chart](MakerBadges.png)

### [Dai GraphQL](https://developer.makerdao.com/dai/1/graphql/)

> Dai GraphQL to check for activities on MakerDAO ecosystem

To enable MakerBadges to check off-chain for activities on MakerDAO ecosystem we're using the following MakerDAO DSS
Contracts:

- **Pot**: to check if a user has accrued 1 or more Dai from DSR.
- **Dai**: to check if a user has sent 10 or 20 Dai.
- **Chief**: to check if a user has voted in Executive Spells or Governance Polls.
- **Flip**: to check if a user has bidden or won Collateral Auctions.
- **Cat**: to check if a user have bitten an unsafe vault.

### [BadgeRoles](./contracts/BadgeRoles.sol)

> BadgeRoles Access Management for Default Admin, Admin, Templater and Pauser Role

BadgeRoles inherits the OpenZeppelin AccessControl.sol, allowing the owner of the contract to be set as Default Admin,
Admin, Pauser and also as Templater, to add an Admin via **addAdmin** and remove an Admin via **removeAdmin** functions
as well as to add a Templater via **addTemplater** and remove a Templater via **removeTemplater** functions.

### [MakerBadges](./contracts/MakerBadges.sol)

> MakerBadges to manage Templates and activate Non-transferable Badges for redeemers

To enable MakerBadges to verify redeemers checked off-chain for activities on MakerDAO ecosystem, when they try to
redeem their Badge, we query the Dai GraphQL, and we generate a Merkle Tree of off-chain checked redeemers for each
Badge Template.

In particular, we'll use:

- **verify** to verify redeemers checked off-chain, using a proof (generated from the Merkle Tree for each redeemer).

MakerBadges let the admin to set (via **setRootHashes**) an array of root hashes, called **roots**, ordered by template
Id to allow redemeers checked off-chain for activities via TheGraph on the frontend, and stored into a Merkle Tree, to
redeem Badges.

A Merkle Tree is generated for every Badge Template and the root hash is then updated by the admin of MakerBadges on a
weekly/monthly basis to allow batches of redeemers to redeem Badges.

MakerBadges inherits BadgeRoles, allowing a Templater to create a new template via **createTemplate** specifying name,
description and image. A Templater can also update the template info via **updateTemplate**.

Getter functions are implemented to get template metadata via **templates** and the current number of templates via
**getTemplateCount**.

It also inherits ERC721, where the **\_transfer** has been overridden to implement the non-transferable feature,
allowing redeemers checked off-chain to redeem a Badge for a specific activity on MakerDAO ecosystem via
**activateBadge** that will verify if the caller is a redeemer and then will allow the caller to mint a new
Non-transferable Maker Badge with tokenURI stored on IPFS (eg. "ipfs-hash.json").

**templateQuantities** getter function is implemented to get the number of badges activated for each template.

To avoid that a redeemer could activate the same Badge twice, the **tokenId** is generated via **\_getTokenId"** that
concatenates the **redeemer** address and the **templateId** to get a unique hard-coded identifier. The **\_mint**
function will check then if the tokenId already exists (= already minted) and if not mint a new Badge.

**getBadgeRedeemer** and **getBadgeTemplate** getter functions are implemented to get the redeemer address and
**templateId** hard-coded inside the specified **tokenId**.

Finally **setBaseURI** is added to allow the default admin to set a new baseURI.

During deployment the contract sets the following ERC721 metadata:

- name: "MakerBadges"
- symbol: "MAKER"
- baseURI: "https://badges.makerdao.com/token/"

# Setup

Clone this GitHub repository.

## Steps to compile and test

- Local dependencies:
  - HardHat
  - TypeChain
  - OpenZeppelin Contracts
  - Ethers
  - Waffle
  - Solhint
  - Solcover
  - Prettier
  ```sh
  $ yarn install
  ```
- Global dependencies:
  - Slither (optional):
  ```sh
  $ git clone https://github.com/crytic/slither.git && cd slither
  $ sudo python3 setup.py install
  ```
  - MythX CLI (optional):
  ```sh
  $ git clone git://github.com/dmuhs/mythx-cli && cd mythx-cli
  $ sudo python setup.py install
  ```
  - Echidna (optional):  
    [binaries](https://github.com/crytic/echidna/releases)

## Running the project with local test network

- Compile the smart contracts using HardHat with the following command:
  ```sh
  $ yarn build
  ```
- Deploy the smart contracts locally with the following commands:
  ```sh
  $ yarn dev
  ```
  in a separate terminal:
  ```sh
  $ yarn deploy:local
  ```
- Test the smart contracts using Waffle & Ethers with Fixtures:
  ```sh
  $ yarn test
  ```
- Analyze the smart contracts using Slither with the following command (optional):
  ```sh
  $ slither .
  ```
- Analyze the smart contracts using MythX CLI with the following command (optional):
  ```sh
  $ mythx analyze
  ```
- Analyze the smart contracts using Echidna with the following command (optional):
  ```sh
  $ echidna-test . --contract BadgeRolesEchidnaTest --config echidna.config.yml
  ```

# Deploy

## Deploy on Sokol Testnet

- Get an Ethereum Account on Metamask.
- On the landing page, click “Get Chrome Extension.”
- Add mnemonic to MNEMONIC .env file.
- Add deployer address to DEPLOYER_ADDRESS .env file.
- Add Sokol as custom RPC via [Chainlist](https://chainlist.org/).
- Get some test ether from a [Sokol's faucet](https://faucet.poa.network/).
- Uncomment the following lines in hardhat.config.ts:

  ```
  //if (!process.env.MNEMONIC) throw new Error('Please set your MNEMONIC in a .env file');
  //const mnemonic = process.env.MNEMONIC as string;

  //if (!process.env.DEPLOYER_ADDRESS) throw new Error("Please set your DEPLOYER_ADDRESS in a .env file")
  ```

- Replace the following with `mnemonic: mnemonic`:

  ```
  mnemonic: "test test test test test test test test test test test junk"
  ```

- Deploy MakerBadges on Sokol via the following command:
  ```sh
  $ yarn deploy:sokol
  ```
- Flatten MakerBadges to verify on [Blockscout](https://blockscout.com/poa/sokol/):
  ```
  yarn flatten
  ```

## Development Deployments

### Sokol

**MakerBadges:**
[0x3715Bd0A4B395e8ee9E534510AABfcED59977213](https://blockscout.com/poa/sokol/address/0x3715Bd0A4B395e8ee9E534510AABfcED59977213/contracts)

# Interface

- [Frontend](https://github.com/scottrepreneur/maker-badges/tree/master/packages/frontend)

# Backend

- [Merkle Service](https://github.com/scottrepreneur/maker-badges/tree/master/packages/api)

# About

## Inspiration & References

- [open-proofs](https://github.com/rrecuero/open-proofs)
- [ERC1238](https://github.com/ethereum/EIPs/issues/1238)
- [ERC721](https://eips.ethereum.org/EIPS/eip-721)
- [POAP](https://www.poap.xyz/)
- [MakerDAO](https://makerdao.com/en/)
- [Chai](https://chai.money/about.html)
- [aztec-airdrop](https://github.com/nanexcool/aztec-airdrop)

## CDIPs

- CDIP [18](https://github.com/makerdao/community/issues/537)
- CDIP [29](https://github.com/makerdao/community/issues/721)
- CDIP [38](https://github.com/makerdao/community/issues/1180)

## Authors

Project created by [Nazzareno Massari](https://nazzarenomassari.com) and Scott Herren.  
MakerDAOx and UI by [Josi](https://twitter.com/0xO0O0)  
A special thanks for support to [Gonzalo Balabasquer](https://github.com/gbalabasquer).  
Security Check by [Scott Bigelow](https://github.com/epheph)  
MakerDAO Badge Illustrations by [Richard Rosa](https://www.artstation.com/artwork/oAJeVq)
