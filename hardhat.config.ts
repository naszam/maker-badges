import { HardhatUserConfig } from "hardhat/config"
import { NetworkUserConfig } from "hardhat/types"
import "./tasks/accounts"
import "./tasks/clean"

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

//if (!process.env.DEPLOYER_ADDRESS) throw new Error("Please set your DEPLOYER_ADDRESS in a .env file")

// Define network configurations
function createNetworkConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string = "https://" + network + ".poa.network"
  return {
    accounts: {
      count: 10,
      initialIndex: 0,
      mnemonic: process.env.MNEMONIC,
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
    version: "0.6.12",
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
