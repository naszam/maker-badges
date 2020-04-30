let catchRevert = require("./exceptionsHelpers.js").catchRevert
var BadgeRoles = artifacts.require('./BadgeRoles')

contract('BadgeRoles', function(accounts) {

  const owner = accounts[0]
  const minter = accounts[1]
  const random = accounts[3]

  const DEFAULT_ADMIN_ROLE = "0x00"


  let instance

  // Before Each
  beforeEach(async () => {
    instance = await BadgeRoles.new()
  })

  // Check that the owner is set as the deploying address
  // Check that the owner is set as admin when the contract is deployed
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

    // Check addMinter() for success when an admin is adding a new minter
    // Check addMinter() for sucessfully emit event when the minter is added
    // Check addMinter() for failure when a random address try to add a new minter
    describe("addMinter()", async () => {

      it("admins should be able to add a minter", async () => {
        await instance.addMinter(minter, {from:owner})
        const minterAdded = await instance.isMinter(minter, {from:random})
        assert.isTrue(minterAdded, "only admin can add new admins")
      })

      it("should emit the appropriate event when a minter is added", async () => {
        const result = await instance.addMinter(minter, {from:owner})
        assert.equal(result.logs[0].event, "RoleGranted", "RoleGranted event not emitted, check addMinter method")
      })

      it("random address should not be able to add a minter", async () => {
        await catchRevert(instance.addMinter(minter, {from:random}))
      })
    })

    // Check removeMinter() for success when a minter is removing an admin
    // Check remvoveMinter() for sucessfully emit event when the minter is removed
    // Check removeMinter() for failure when a random address try to remove a minter
    describe("removeMinter()", async () => {

      it("admins should be able to remove a minter", async () => {
        await instance.addMinter(minter, {from:owner})
        await instance.removeMinter(minter, {from:owner})
        const minterRemoved = await instance.isMinter(minter, {from:random})
        assert.isFalse(minterRemoved, "only admin can remove minter")
      })

      it("should emit the appropriate event when a minter is removed", async () => {
        await instance.addMinter(minter, {from:owner})
        const result = await instance.removeMinter(minter, {from:owner})
        assert.equal(result.logs[0].event, "RoleRevoked", "RoleRevoked event not emitted, check removeMinter method")
      })

      it("random address should not be able to remove a minter", async () => {
        await instance.addMinter(minter, {from:owner})
        await catchRevert(instance.removeMinter(minter, {from:random}))
      })
    })
  })
})
