// BadgeRoles.ts

import { expect } from "chai"
import { ethers, waffle, web3 } from "hardhat"

import { MinimalForwarder, MinimalForwarder__factory } from "../typechain"
import { BadgeRoles, BadgeRoles__factory } from "../typechain"

const { soliditySha3 } = web3.utils
const { HashZero, AddressZero } = ethers.constants

describe("BadgeRoles", () => {
  let signers: any
  let badgeroles: BadgeRoles

  const DEFAULT_ADMIN_ROLE = HashZero!
  const ADMIN_ROLE = soliditySha3("ADMIN_ROLE")!
  const TEMPLATER_ROLE = soliditySha3("TEMPLATER_ROLE")!
  const PAUSER_ROLE = soliditySha3("PAUSER_ROLE")!

  const fixture = async () => {
    const [deployer, multisig, admin, templater, random] = await ethers.getSigners()
    signers = { deployer, multisig, admin, templater, random }
    const forwarderFab = (await ethers.getContractFactory("MinimalForwarder", deployer)) as MinimalForwarder__factory
    const forwarder = (await forwarderFab.deploy()) as MinimalForwarder
    const badgeFab = (await ethers.getContractFactory("BadgeRoles", deployer)) as BadgeRoles__factory
    return (await badgeFab.deploy(forwarder.address, multisig.address)) as BadgeRoles
  }

  beforeEach("deploy BadgeRoles", async () => {
    badgeroles = await waffle.loadFixture(fixture)
  })

  // Check that the multisig is set as the only default admin when the contract is deployed
  // Check that the multisig is set as the only admin when the contract is deployed
  // Check that the multisig is set as the only templater when the contract is deployed
  // Check that the multisig is set as the only pauser when the contract is deployed
  describe("setup", async () => {
    it("multisig has the default admin role", async () => {
      expect(await badgeroles.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.be.eq("1")
      expect(await badgeroles.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).to.be.eq(signers.multisig.address)
    })
    it("multisig has the admin role", async () => {
      expect(await badgeroles.getRoleMemberCount(ADMIN_ROLE)).to.be.eq("1")
      expect(await badgeroles.getRoleMember(ADMIN_ROLE, 0)).to.be.eq(signers.multisig.address)
    })
    it("multisig has the templater role", async () => {
      expect(await badgeroles.getRoleMemberCount(TEMPLATER_ROLE)).to.be.eq("1")
      expect(await badgeroles.getRoleMember(TEMPLATER_ROLE, 0)).to.be.eq(signers.multisig.address)
    })
    it("multisig has the pauser role", async () => {
      expect(await badgeroles.getRoleMemberCount(PAUSER_ROLE)).to.be.eq("1")
      expect(await badgeroles.getRoleMember(PAUSER_ROLE, 0)).to.be.eq(signers.multisig.address)
    })
  })

  // Check addAdmin for success when the default admin is adding a new admin
  // Check addAdmin for sucessfully emit an event when the admin is added
  // Check addAdmin for failure when a random address tries to add a new admin
  // Check addAdmin for failure when account is set to zero address
  describe("addAdmin", async () => {
    it("default admin should be able to add an admin", async () => {
      await badgeroles.connect(signers.multisig).addAdmin(signers.admin.address)
      expect(await badgeroles.hasRole(ADMIN_ROLE, signers.admin.address)).to.equal(true)
    })
    it("should emit the appropriate event when a new admin is added", async () => {
      await expect(badgeroles.connect(signers.multisig).addAdmin(signers.admin.address))
        .to.emit(badgeroles, "RoleGranted")
        .withArgs(ADMIN_ROLE, signers.admin.address, signers.multisig.address)
    })
    it("should not allow to add an admin form random user", async () => {
      await expect(badgeroles.connect(signers.random).addAdmin(signers.admin.address)).to.be.revertedWith(
        "MakerBadges/only-def-admin",
      )
    })
    it("should revert when account is set to zero address", async () => {
      await expect(badgeroles.connect(signers.multisig).addAdmin(AddressZero)).to.be.revertedWith(
        "MakerBadges/invalid-account-address",
      )
    })
  })

  // Check removeAdmin for success when the default admin is removing an admin
  // Check removeAdmin for sucessfully emit event when the admin is removed
  // Check removeAdmin for failure when a random address tries to remove an admin
  describe("removeAdmin", async () => {
    beforeEach(async () => {
      await badgeroles.connect(signers.multisig).addAdmin(signers.admin.address)
    })
    it("default admin should be able to remove an admin", async () => {
      await badgeroles.connect(signers.multisig).removeAdmin(signers.admin.address)
      expect(await badgeroles.hasRole(ADMIN_ROLE, signers.admin.address)).to.equal(false)
    })
    it("should emit the appropriate event when an admin is removed", async () => {
      await expect(badgeroles.connect(signers.multisig).removeAdmin(signers.admin.address))
        .to.emit(badgeroles, "RoleRevoked")
        .withArgs(ADMIN_ROLE, signers.admin.address, signers.multisig.address)
    })
    it("should not allow to remove an admin form random user", async () => {
      await expect(badgeroles.connect(signers.random).removeAdmin(signers.admin.address)).to.be.revertedWith(
        "MakerBadges/only-def-admin",
      )
    })
  })

  // Check addTemplater for success when the default admin is adding a new templater
  // Check addTemplater for sucessfully emit event when the templater is added
  // Check addTemplater for failure when a random address tries to add a templater
  // Check addTemplater for failure when account is set to zero address
  describe("addTemplater", async () => {
    it("default admin should be able to add a templater", async () => {
      await badgeroles.connect(signers.multisig).addTemplater(signers.templater.address)
      expect(await badgeroles.hasRole(TEMPLATER_ROLE, signers.templater.address)).to.equal(true)
    })
    it("should emit the appropriate event when a new templater is added", async () => {
      await expect(badgeroles.connect(signers.multisig).addTemplater(signers.templater.address))
        .to.emit(badgeroles, "RoleGranted")
        .withArgs(TEMPLATER_ROLE, signers.templater.address, signers.multisig.address)
    })
    it("should not allow to add a templater form random user", async () => {
      await expect(badgeroles.connect(signers.random).addTemplater(signers.templater.address)).to.be.revertedWith(
        "MakerBadges/only-def-admin",
      )
    })
    it("should revert when account is set to zero address", async () => {
      await expect(badgeroles.connect(signers.multisig).addTemplater(AddressZero)).to.be.revertedWith(
        "MakerBadges/invalid-account-address",
      )
    })
  })

  // Check removeTemplater for success when the default admin is removing a new templater
  // Check removeTemplater for sucessfully emit event when the templater is removed
  // Check removeTemplater for failure when a random address tries to remove a templater
  describe("removeTemplater", async () => {
    beforeEach(async () => {
      await badgeroles.connect(signers.multisig).addTemplater(signers.templater.address)
    })
    it("default admin should be able to remove a templater", async () => {
      await badgeroles.connect(signers.multisig).removeTemplater(signers.templater.address)
      expect(await badgeroles.hasRole(TEMPLATER_ROLE, signers.templater.address)).to.equal(false)
    })
    it("should emit the appropriate event when a templater is removed", async () => {
      await expect(badgeroles.connect(signers.multisig).removeTemplater(signers.templater.address))
        .to.emit(badgeroles, "RoleRevoked")
        .withArgs(TEMPLATER_ROLE, signers.templater.address, signers.multisig.address)
    })
    it("should not allow to remove a templater form random user", async () => {
      await expect(badgeroles.connect(signers.random).removeTemplater(signers.templater.address)).to.be.revertedWith(
        "MakerBadges/only-def-admin",
      )
    })
  })

  // Check pause for success when the pauser is pausing all the functions
  // Check pause for sucessfully emit event when the functions are paused
  // Check pause for failure when a random address tries to pause all the functions
  describe("pause", async () => {
    it("multisig can pause", async () => {
      await badgeroles.connect(signers.multisig).pause()
      expect(await badgeroles.paused()).to.be.eq(true)
    })
    it("should emit the appropriate event when the functions are paused", async () => {
      await expect(badgeroles.connect(signers.multisig).pause())
        .to.emit(badgeroles, "Paused")
        .withArgs(signers.multisig.address)
    })
    it("random accounts cannot pause", async () => {
      await expect(badgeroles.connect(signers.random).pause()).to.be.revertedWith("MakerBadges/only-pauser")
    })
  })

  // Check unpause for success when the pauser is unpausing all the functions
  // Check unpause for sucessfully emit event when the functions are unpaused
  // Check unpause for failure when a random address try to unpause all the functions
  describe("unpause", async () => {
    beforeEach(async () => {
      await badgeroles.connect(signers.multisig).pause()
    })
    it("multisig can unpause", async () => {
      await badgeroles.connect(signers.multisig).unpause()
      expect(await badgeroles.paused()).to.be.eq(false)
    })
    it("should emit the appropriate event when the functions are unpaused", async () => {
      await expect(badgeroles.connect(signers.multisig).unpause())
        .to.emit(badgeroles, "Unpaused")
        .withArgs(signers.multisig.address)
    })
    it("random accounts cannot unpause", async () => {
      await expect(badgeroles.connect(signers.random).unpause()).to.be.revertedWith("MakerBadges/only-pauser")
    })
  })
})
