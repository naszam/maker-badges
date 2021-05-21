import hre from "hardhat"
import { Contract, ContractFactory } from "ethers"
import { Signer } from "@ethersproject/abstract-signer"
import fs from "fs"

const { ethers } = hre

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

  // Deploy MinimalForwarder
  const MinimalForwarder: ContractFactory = await ethers.getContractFactory("MinimalForwarder")
  const forwarder: Contract = await MinimalForwarder.connect(deployer).deploy()
  await forwarder.deployed()

  // Deploy MakerBadges
  const MakerBadges: ContractFactory = await ethers.getContractFactory("MakerBadges")
  const badges: Contract = await MakerBadges.connect(deployer).deploy(forwarder.address)
  await badges.deployed()
  fs.writeFileSync(
    "deploy.json",
    JSON.stringify(
      {
        MinimalForwarder: forwarder.address,
        MakerBadges: badges.address,
      },
      null,
      2,
    ),
  )
  console.log(`MinimalForwarder: ${forwarder.address}\nMakerBadges: ${badges.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error)
    process.exit(1)
  })
