let catchRevert = require("./exceptionsHelpers.js").catchRevert
var BadgeFactory = artifacts.require('./BadgeFactory')

contract('BadgeFactory', function(accounts) {

  const owner = accounts[0]
  const minter = accounts[1]
  const random = accounts[3]

  const DEFAULT_ADMIN_ROLE = "0x00"
  const name = "Beginner"
  const description = "Beginner Template"
  const image = "badge.pdf"
  const limit = "10"
  const templateId = "0"



  let instance

  // Before Each
  beforeEach(async () => {
    instance = await BadgeFactory.new()
    await instance.addMinter(minter, {from:owner})
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

      // Check createTemplate() for success when a minter is trying to create a new template
      // Check createTemplate() for sucessfully emit event when the template is created
      // Check createTemplate() for failure when a random address try to create a new template
      describe("createTemplate()", async () => {

        it("minters should be able to create a template", async () => {
          await instance.createTemplate(name, description, image, limit, {from:minter})
          const result = await instance.getTemplate(templateId, {from:random})
          assert.equal(result[0], name, "the name of the created template does not match the expected value")
          assert.equal(result[1], description, "the description of the created template does not match the expected value")
          assert.equal(result[2], image, "the image of the created template does not match the expected value")
          assert.equal(result[3], limit, "the limit of the created template does not match the expected value")
        })

        it("should emit the appropriate event when a template is created", async () => {
          const result = await instance.createTemplate(name, description, image, limit, {from:minter})
          assert.equal(result.logs[0].event, "NewTemplate", "NewTemplate event not emitted, check createTemplate method")
        })

        it("random address should not be able to create a new template", async () => {
          await catchRevert(instance.createTemplate(name, description, image, limit, {from:random}))
        })

      })

      // Check destroyTemplate() for success when a minter is trying to destroy a template
      // Check destroyTemplate() for sucessfully emit event when the template is destroyed
      // Check destroyTemplate() for failure when a random address try to destroy a template
      describe("destroyTemplate()", async () => {

        it("minters should be able to destroy a template", async () => {
          await instance.createTemplate(name, description, image, limit, {from:minter})
          await instance.destroyTemplate(templateId, {from:minter})
          await catchRevert(instance.getTemplate(templateId, {from:random}))
          const result = await instance.getTemplatesCount({from:random})
          assert.equal(result, 0, "the number of templates does not match the expected value")
        })

        it("should emit the appropriate event when a template is destroyed", async () => {
          await instance.createTemplate(name, description, image, limit, {from:minter})
          const result = await instance.destroyTemplate(templateId, {from:minter})
          assert.equal(result.logs[0].event, "TemplateDestroyed", "TemplateDestroyed event not emitted, check destroyTemplate method")
        })

        it("random address should not be able to destroy a template", async () => {
          await instance.createTemplate(name, description, image, limit, {from:minter})
          await catchRevert(instance.destroyTemplate(templateId, {from:random}))
        })

      })
   })



})
