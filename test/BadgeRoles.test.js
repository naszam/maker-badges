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

      it("Owner should be the only admin when the contract is created", async() => {
          const admins = await instance.getRoleMemberCount(DEFAULT_ADMIN_ROLE)
          assert.equal(admins, "1", "the owner should be the only admin")
      })


  })

  describe("Functions", () => {

    // Check addTemplater() for success when an admin is adding a new templater
    // Check addTemplater() for sucessfully emit event when the templater is added
    // Check addTemplater() for failure when a random address try to add a templater
    describe("addTemplater()", async () => {

      it("admin should be able to add a new templater", async () => {
        await instance.addTemplater(templater, {from:owner})
        const templaterAdded = await instance.isTemplater(templater, {from:random})
        assert.isTrue(templaterAdded, "only admins can add a new templater")
      })

      it("should emit the appropriate event when a new templater is added", async () => {
        const result = await instance.addTemplater(templater, {from:owner})
        assert.equal(result.logs[0].event, "RoleGranted", "RoleGranted event not emitted, check addTemplater method")
      })

      it("random address should not be able to add a new templater", async () => {
        await catchRevert(instance.addTemplater(templater, {from:random}))
      })
    })

    // Check pause() for success when a pauser is pausing all the functions
    // Check pause() for sucessfully emit event when the functions are paused
    // Check pause() for failure when a random address try to pause all the functions
    describe("pause()", async () => {

      it("pauser should be able to pause all the functions", async () => {
        await instance.pause({from:owner})
        await catchRevert(instance.pause({from:owner}))
      })

      it("should emit the appropriate event when the functions are paused", async () => {
        const result = await instance.pause({from:owner})
        assert.equal(result.logs[0].event, "Paused", "Paused event not emitted, check pause method")
      })

      it("random address should not be able to pause all functions", async () => {
        await catchRevert(instance.pause({from:random}))
      })
    })

    // Check unpause() for success when an amdin is unpausing all the functions
    // Check unpause() for sucessfully emit event when the functions are unpaused
    // Check unpause() for failure when a random address try to unpause all the functions
    describe("unpause()", async () => {

      it("admins should be able to unpause all the functions", async () => {
        await instance.pause({from:owner})
        await instance.unpause({from:owner})
        await catchRevert(instance.unpause({from:owner}))
      })

      it("should emit the appropriate event when all functions are unpaused", async () => {
        await instance.pause({from:owner})
        const result = await instance.unpause({from:owner})
        assert.equal(result.logs[0].event, "Unpaused", "Unpaused event not emitted, check pause method")
      })

      it("random address should not be able to unpause all the functions", async () => {
        await instance.pause({from:owner})
        await catchRevert(instance.unpause({from:random}))
      })
    })
  })
})
