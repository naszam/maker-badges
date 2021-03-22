import { HardhatUserConfig } from "hardhat/config"

import "@typechain/hardhat"
import "solidity-coverage"

const config: HardhatUserConfig = {
  solidity: {
    version: "0.6.12",
  },
}

export default config
