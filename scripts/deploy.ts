import hre from "hardhat"
import { Contract, ContractFactory } from "ethers"
import { Signer } from "@ethersproject/abstract-signer"

const { ethers } = hre
const padding = 25

async function main(): Promise<void> {
  const network = hre.network.name

  await hre.run("compile")

  let deployer: Signer
  if (network === "localhost") {
    // Localhost
    console.log("Deploying MakerBadges on localhost...")
    // Set deployer
    const signers: Signer[] = await ethers.getSigners()
    deployer = signers[0]
  } else {
    const signers: Signer[] = await ethers.getSigners()
    deployer = signers[0]
    const deployerAddress = await deployer.getAddress()
    if (deployerAddress !== process.env.DEPLOYER_ADDRESS) {
      throw new Error("Wrong deployer address!")
    }
  }

  // Deploy MakerBadges
  const MakerBadges: ContractFactory = await ethers.getContractFactory("MakerBadges")
  const badges: Contract = await MakerBadges.connect(deployer).deploy()
  await badges.deployed()
  console.log("MakerBadges deployed to".padEnd(padding), badges.address)
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error)
    process.exit(1)
  })
