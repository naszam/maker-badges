let catchRevert = require("./exceptionsHelpers.js").catchRevert
var MakerBadges = artifacts.require('./MakerBadges')

contract('MakerBadges', function(accounts) {

  const owner = accounts[0]
  const random = accounts[1]
  const redeemer = accounts[2]

  const DEFAULT_ADMIN_ROLE = "0x00"



  let instance

  // Before Each
  beforeEach(async () => {
    instance = await MakerBadges.new()
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

  





})
