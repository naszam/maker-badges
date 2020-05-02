let catchRevert = require("./exceptionsHelpers.js").catchRevert
var BadgeRoles = artifacts.require('./BadgeRoles')

contract('BadgeRoles', function(accounts) {

  const owner = accounts[0]
  const templater = accounts[1]
  const random = accounts[3]

  const DEFAULT_ADMIN_ROLE = "0x00"


  let instance

  // Before Each
  beforeEach(async () => {
    instance = await BadgeRoles.new()
  })

  // Check that the owner is set as the deploying address
  // Check that the owner is set as admin when the contract is deployed
  // Check that the owner is the only admin when the contract is deployed
  describe("Setup", async() => {

      it("OWNER should be set to the deploying address", async() => {
          const ownerAddress = await instance.owner()
          assert.equal(ownerAddress, owner, "the deploying address should be the owner")
      })

      it("Owner should be set as Default Admin when the contract is created", async() => {
          const adminAdded = await instance.isAdmin(owner)
          assert.isTrue(adminAdded, "the owner should be set as default admin")
      })

      it("Owner should be the only admin when the contract is created", async() => {
          const admins = await instance.getRoleMemberCount(DEFAULT_ADMIN_ROLE)
          assert.equal(admins, "1", "the owner should be the only admin")
      })


  })

  describe("Functions", () => {

    // Check addTemplater() for success when an admin is adding a new templater
    // Check addTemplater() for sucessfully emit event when the templater is added
    // Check addTemplater() for failure when a random address try to add a new templater
    describe("addTemplater()", async () => {

      it("admins should be able to add a templater", async () => {
        await instance.addTemplater(templater, {from:owner})
        const templaterAdded = await instance.isTemplater(templater, {from:random})
        assert.isTrue(templaterAdded, "only admin can add new templaters")
      })

      it("should emit the appropriate event when a templater is added", async () => {
        const result = await instance.addTemplater(templater, {from:owner})
        assert.equal(result.logs[0].event, "RoleGranted", "RoleGranted event not emitted, check addTemplater method")
      })

      it("random address should not be able to add a templater", async () => {
        await catchRevert(instance.addTemplater(templater, {from:random}))
      })
    })

    // Check removeTemplater() for success when an amdin is removing a templater
    // Check remvoveTemplater() for sucessfully emit event when the templater is removed
    // Check removeTemplater() for failure when a random address try to remove a templater
    describe("removeTemplater()", async () => {

      it("admins should be able to remove a templater", async () => {
        await instance.addTemplater(templater, {from:owner})
        await instance.removeTemplater(templater, {from:owner})
        const templaterRemoved = await instance.isTemplater(templater, {from:random})
        assert.isFalse(templaterRemoved, "only admin can remove templater")
      })

      it("should emit the appropriate event when a templater is removed", async () => {
        await instance.addTemplater(templater, {from:owner})
        const result = await instance.removeTemplater(templater, {from:owner})
        assert.equal(result.logs[0].event, "RoleRevoked", "RoleRevoked event not emitted, check removeTemplater method")
      })

      it("random address should not be able to remove a templater", async () => {
        await instance.addTemplater(templater, {from:owner})
        await catchRevert(instance.removeTemplater(templater, {from:random}))
      })	
    })
  })
})
