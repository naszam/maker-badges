import { HardhatUserConfig } from "hardhat/config"

import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-web3"

import "@typechain/hardhat"
import "solidity-coverage"

const config: HardhatUserConfig = {
  solidity: {
    version: "0.6.12",
  },
}

export default config
