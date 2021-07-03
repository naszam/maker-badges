import { MerkleTree } from "merkletreejs"
import { task } from "hardhat/config"
import { TASK_MERKLE } from "./task-names"

task(TASK_MERKLE, "Prints the merkle tree root hash and proof of redeemer")
  .addParam("redeemer", "The redeemer address to add to the merkle tree")
  .setAction(async (args, hre) => {
    const { HashZero, AddressZero } = hre.ethers.constants
    const { soliditySha3 } = hre.web3.utils
    let signers: any

    const [addr0, addr1, addr2, addr3, addr4] = await hre.ethers.getSigners()
    signers = { addr0, addr1, addr2, addr3, addr4, args }
    const hash0 = soliditySha3(signers.addr0.address)
    const hash1 = soliditySha3(signers.addr1.address)
    const hash2 = soliditySha3(signers.addr2.address)
    const hash3 = soliditySha3(signers.addr3.address)
    const hash4 = soliditySha3(signers.addr4.address)
    const leaf = soliditySha3(signers.args.redeemer)!
    const leaves = [hash0, hash1, hash2, hash3, hash4, leaf]
    const merkleTree = new MerkleTree(leaves, soliditySha3, { sortPairs: true })
    const root = merkleTree.getHexRoot()
    const rootHashes = [root, HashZero, HashZero, HashZero]
    console.log("Root Hashes: ", rootHashes)
    const proof = merkleTree.getHexProof(leaf)
    console.log("Redeemer Proof:", proof)
  })
