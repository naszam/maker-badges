// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from "hardhat"
import { Contract, ContractFactory } from "ethers"
import { Signer } from "@ethersproject/abstract-signer"

const { ethers } = hre
const padding = 25

async function main(): Promise<void> {
  const network = hre.network.name

  // Hardhat always runs the compile task when running scripts through it.
  // If this runs in a standalone fashion you may want to call compile manually
  // to make sure everything is compiled
  await hre.run("compile")

  let deployer: Signer
  if (network === "localhost") {
    // Localhost
    console.log("Deploying MakerBadges on localhost...")

    // Set deployer
    const signers: Signer[] = await ethers.getSigners()
    deployer = signers[0]
  } else {
    // We want to deploy with the third account derived from the mnemonic, and we hardcode that
    // address here to enforce that
    const signers: Signer[] = await ethers.getSigners()
    deployer = signers[0]
    const deployerAddress = await deployer.getAddress()
    if (deployerAddress !== process.env.DEPLOYER_ADDRESS) {
      throw new Error("Wrong deployer address!")
    }
  }

  // Deploy MakerBadges contract
  const MakerBadges: ContractFactory = await ethers.getContractFactory("MakerBadges")
  const badges: Contract = await MakerBadges.connect(deployer).deploy()
  await badges.deployed()
  console.log("MakerBadges deployed to".padEnd(padding), badges.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error)
    process.exit(1)
  })
