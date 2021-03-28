// MakerBadges.ts

import { expect } from "chai"
import { ethers, web3 } from "hardhat"

import { MakerBadges, MakerBadges__factory } from "../typechain"

import { MerkleTree } from "merkletreejs"

import { keccak256 } from "keccak256"

require("chai").use(require("chai-as-promised")).should()

describe("MakerBadges", async () => {
  let signers: any
  let makerbadges: MakerBadges

  const template_name = "Beginner"
  const template_description = "Beginner Template"
  const template_image = "badge.png"
  const template_name2 = "Intermediate"
  const template_description2 = "Intermediate Template"
  const template_image2 = "badge2.png"
  const templateId = "0"
  const index1 = "0"
  const index2 = "1"

  const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero
  const TEMPLATER_ROLE = web3.utils.soliditySha3("TEMPLATER_ROLE")
  const PAUSER_ROLE = web3.utils.soliditySha3("PAUSER_ROLE")

  const baseURI2 = "https://badegs.com/token/"
  const tokenURI = "ipfs.js"

  beforeEach(async () => {
    const [deployer, owner, templater, redeemer, random] = await ethers.getSigners()
    signers = { deployer, templater, redeemer, random }
    const MakerBadgesFactory = (await ethers.getContractFactory("MakerBadges", deployer)) as MakerBadges__factory
    makerbadges = await MakerBadgesFactory.deploy()
  })

  // Check that the deployer is set as the only admin when the contract is deployed
  // Check that the deployer is set as the only templater when the contract is deployed
  // Check that the deployer is set as the only pauser when the contract is deployed
  describe("Setup", async () => {
    it("deployer has the default admin role", async () => {
      const admin_count = await makerbadges.getRoleMemberCount(DEFAULT_ADMIN_ROLE)
      admin_count.toString().should.equal("1")
      const def_admin = await makerbadges.getRoleMember(DEFAULT_ADMIN_ROLE, 0)
      def_admin.should.equal(signers.deployer.address)
    })

    it("deployer has the templater role", async () => {
      const templater_count = await makerbadges.getRoleMemberCount(TEMPLATER_ROLE)
      templater_count.toString().should.equal("1")
      const templater = await makerbadges.getRoleMember(TEMPLATER_ROLE, 0)
      templater.should.equal(signers.deployer.address)
    })

    it("deployer has the pauser role", async () => {
      const pauser_count = await makerbadges.getRoleMemberCount(PAUSER_ROLE)
      pauser_count.toString().should.equal("1")
      const pauser = await makerbadges.getRoleMember(PAUSER_ROLE, 0)
      pauser.should.equal(signers.deployer.address)
    })
  })

  // Check ERC721 metadata
  describe("ERC721 metadata", async () => {
    it("has a name", async () => {
      const name = await makerbadges.name()
      name.should.equal("MakerBadges")
    })

    it("has a symbol", async () => {
      const symbol = await makerbadges.symbol()
      symbol.should.equal("MAKER")
    })

    it("has a baseURI", async () => {
      const baseURI = await makerbadges.baseURI()
      baseURI.should.equal("https://badges.makerdao.com/token/")
    })

    it("return an updated baseURI", async () => {
      await makerbadges.connect(signers.deployer).setBaseURI(baseURI2)
      const baseURI = await makerbadges.baseURI()
      baseURI.should.equal(baseURI2)
    })

    it("reverts when querying metadata for non existent tokenId", async () => {
      await expect(makerbadges.connect(signers.random).tokenURI("0")).to.be.revertedWith(
        "ERC721Metadata: URI query for nonexistent token",
      )
    })
  })

  // Check createTemplate() for success when a templater is trying to create a new template
  // Check createTemplate() for sucessfully emit event when the template is created
  // Check createTemplate() for failure when a random address try to create a new template
  describe("createTemplate()", async () => {
    it("templater should be able to create a template", async () => {
      await makerbadges.connect(signers.deployer).createTemplate(template_name, template_description, template_image)
      const receipt = await makerbadges.templates(templateId)
      receipt[0].should.equal(template_name)
      receipt[1].should.equal(template_description)
      receipt[2].should.equal(template_image)
      const count = await makerbadges.getTemplatesCount()
      count.toString().should.equal("1")
    })

    it("should emit the appropriate event when a template is created", async () => {
      await expect(
        makerbadges.connect(signers.deployer).createTemplate(template_name, template_description, template_image),
      )
        .to.emit(makerbadges, "NewTemplate")
        .withArgs(templateId, template_name, template_description, template_image)
    })

    it("should not allow create a new template from random user", async () => {
      await expect(
        makerbadges.connect(signers.random).createTemplate(template_name, template_description, template_image),
      ).to.be.revertedWith("MakerBadges: caller is not a template owner")
    })
  })
})
