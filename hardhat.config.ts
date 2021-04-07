import { task, HardhatUserConfig } from "hardhat/config"
import { node_url, accounts } from "./utils/network"

import "@nomiclabs/hardhat-solhint"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-web3"

import "@typechain/hardhat"
import "solidity-coverage"
import "hardhat-gas-reporter"
import "hardhat-deploy"
import "hardhat-deploy-ethers"
import "dotenv/config"

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(await account.address)
  }
})

const config: HardhatUserConfig = {
  solidity: {
    version: "0.6.12",
  },
  networks: {
    hardhat: {
      blockGasLimit: 10000000,
    },
    localhost: {
      url: node_url("localhost"),
      accounts: accounts(),
    },
    xdai: {
      url: node_url("xdai"),
      accounts: accounts("xdai"),
    },
    sokol: {
      url: node_url("sokol"),
      accounts: accounts("sokol"),
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    coinmarketcap: process.env.MARKET_API_KEY,
  },
}

export default config
