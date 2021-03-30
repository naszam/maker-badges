// BadgeRoles.ts

import { expect } from "chai"
import { ethers, web3 } from "hardhat"

import { BadgeRoles, BadgeRoles__factory } from "../typechain"

const { soliditySha3 } = web3.utils
const { HashZero, AddressZero } = ethers.constants

describe("MakerBadges", () => {
  let signers: any
  let badgeroles: BadgeRoles

  const DEFAULT_ADMIN_ROLE = HashZero
  const ADMIN_ROLE = soliditySha3("ADMIN_ROLE")
  const TEMPLATER_ROLE = soliditySha3("TEMPLATER_ROLE")
  const PAUSER_ROLE = soliditySha3("PAUSER_ROLE")

  beforeEach(async () => {
    const [deployer, admin, templater, random] = await ethers.getSigners()
    signers = { deployer, admin, templater, random }
    const BadgeRolesFactory = (await ethers.getContractFactory("BadgeRoles", deployer)) as BadgeRoles__factory
    badgeroles = await BadgeRolesFactory.deploy()
  })

  // Check that the deployer is set as the only default admin when the contract is deployed
  // Check that the deployer is set as the only admin when the contract is deployed
  // Check that the deployer is set as the only templater when the contract is deployed
  // Check that the deployer is set as the only pauser when the contract is deployed
  describe("setup", async () => {
    it("deployer has the default admin role", async () => {
      expect(await badgeroles.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.be.eq("1")
      expect(await badgeroles.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).to.be.eq(signers.deployer.address)
    })
    it("deployer has the admin role", async () => {
      expect(await badgeroles.getRoleMemberCount(ADMIN_ROLE)).to.be.eq("1")
      expect(await badgeroles.getRoleMember(ADMIN_ROLE, 0)).to.be.eq(signers.deployer.address)
    })
    it("deployer has the templater role", async () => {
      expect(await badgeroles.getRoleMemberCount(TEMPLATER_ROLE)).to.be.eq("1")
      expect(await badgeroles.getRoleMember(TEMPLATER_ROLE, 0)).to.be.eq(signers.deployer.address)
    })
    it("deployer has the pauser role", async () => {
      expect(await badgeroles.getRoleMemberCount(PAUSER_ROLE)).to.be.eq("1")
      expect(await badgeroles.getRoleMember(PAUSER_ROLE, 0)).to.be.eq(signers.deployer.address)
    })
  })
})
