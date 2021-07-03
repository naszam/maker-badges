import { HardhatUserConfig } from "hardhat/config"
import { NetworkUserConfig } from "hardhat/types"
import "./tasks/accounts"
import "./tasks/clean"
import "./tasks/merkle"

import "@nomiclabs/hardhat-solhint"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-web3"

import "@typechain/hardhat"
import "solidity-coverage"
import "hardhat-gas-reporter"
import "dotenv/config"

const chainIds = {
  hardhat: 31337,
  sokol: 77,
  xdai: 100,
}

// Ensure that we have all the environment variables we need.
//if (!process.env.MNEMONIC) throw new Error('Please set your MNEMONIC in a .env file');
//const mnemonic = process.env.MNEMONIC as string;

//if (!process.env.DEPLOYER_ADDRESS) throw new Error("Please set your DEPLOYER_ADDRESS in a .env file")

// Define network configurations
function createNetworkConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string = "https://" + network + ".poa.network"
  return {
    accounts: {
      count: 10,
      initialIndex: 0,
      mnemonic: "test test test test test test test test test test test junk",
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[network],
    url,
  }
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: chainIds.hardhat,
    },
    localhost: {},
    sokol: createNetworkConfig("sokol"),
    xdai: createNetworkConfig("xdai"),
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: false,
        runs: 200,
      },
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    coinmarketcap: process.env.MARKET_API_KEY,
  },
}

export default config
