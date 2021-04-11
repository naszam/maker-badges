import { task, HardhatUserConfig } from "hardhat/config"

import "@nomiclabs/hardhat-solhint"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-web3"

import "@typechain/hardhat"
import "solidity-coverage"
import "hardhat-gas-reporter"
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
    localhost: {},
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    coinmarketcap: process.env.MARKET_API_KEY,
  },
}

export default config
