import hre from "hardhat"
import { Contract } from "@ethersproject/contracts"
import { MinimalForwarder__factory, MakerBadges__factory } from "../typechain"
import { Signer } from "@ethersproject/abstract-signer"
import fs from "fs"

const { ethers } = hre

const multisig = "0x163D2aB63E98044a6C7633A7D450D02884FE3eb1" // placeholder (random multisig sokol address)

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
  const MinimalForwarder: MinimalForwarder__factory = await ethers.getContractFactory("MinimalForwarder")
  const forwarder: Contract = await MinimalForwarder.connect(deployer).deploy()
  await forwarder.deployed()

  // Deploy MakerBadges
  const MakerBadges: MakerBadges__factory = await ethers.getContractFactory("MakerBadges")
  const badges: Contract = await MakerBadges.connect(deployer).deploy(forwarder.address, multisig)
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
