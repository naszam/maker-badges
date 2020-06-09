let catchRevert = require("./exceptionsHelpers.js").catchRevert
const  MerkleTree = require('./merkleTree.js').MerkleTree
var BadgeFactory = artifacts.require('./BadgeFactory')
var MakerBadges = artifacts.require('./MakerBadges')

contract('BadgeFactory', function(accounts) {

  const owner = accounts[0]
  const random = accounts[1]
  const redeemer = accounts[2]
  const addresses = [owner, random, redeemer]

  const merkleTree = new MerkleTree(addresses)
  const root = merkleTree.getHexRoot()
  //console.log(root)
  const rootHashes = [root]
  const proof = merkleTree.getHexProof(redeemer)
  //console.log(proof)

  const DEFAULT_ADMIN_ROLE = "0x00"
  const name = "Beginner"
  const description = "Beginner Template"
  const image = "badge.png"
  const templateId = "0"
  const index1 = "0"
  const index2 = "1"
  const nameNFT = "MakerBadges"
  const symbolNFT = "MAKER"
  const baseURI = "https://badges.makerdao.com/token/"



  let instance

  // Before Each
  beforeEach(async () => {
    maker = await MakerBadges.new()
    instance = await BadgeFactory.new(MakerBadges.address)
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

    // !Tested setting the mintWithTokenURI() function to public (remember to remove "_" before function)
    // Check activateBadge() for success when a redeemer checked off-chain (Merkle Tree) is trying to activate a new Badge
    describe("activateBadge()", async () => {

      it("activateBadge should allow redeemer checked offchain to activate Badge", async () => {
        await instance.createTemplate(name, description, image, {from:owner})
        //await maker.addRedeemer(templateId, random, {from:owner})
        //await maker.verify(templateId, random, {from: random})
        await maker.setRootHashes(rootHashes, {from:owner})
        await instance.activateBadge(proof, templateId, "ipfs.json", {from:redeemer})
      })

    })

    // !Tested setting the mintWithTokenURI() function to public (remember to remove "_" before function)
    // Check mintWithTokenURI() for success when a templater is trying to mint a new token
    describe("mintWithTokenURI()", async () => {
      beforeEach(async function () {
        await instance.mintWithTokenURI(redeemer, "ipfs.json", {from:redeemer})
        await instance.mintWithTokenURI(redeemer, "ipfs.json", {from:redeemer})
      });

      it("check tokenId via tokenOfOwnerByIndex", async () => {
        const firstTokenId = await instance.tokenOfOwnerByIndex(redeemer, index1, {from:random})
        assert.equal(firstTokenId, "0", "the tokenId does not match the expected value")
        const secondTokenId = await instance.tokenOfOwnerByIndex(redeemer, index2, {from:random})
        assert.equal(secondTokenId, "1", "the tokenId does not match the expected value")
      })

      it("check tokenId via tokenByIndex()", async () => {
        const firstTokenIdByIndex = await instance.tokenByIndex(index1, {from:random})
        assert.equal(firstTokenIdByIndex, "0", "the tokenId does not match the expected value")
        const secondTokenIdByIndex = await instance.tokenByIndex(index2, {from:random})
        assert.equal(secondTokenIdByIndex, "1", "the tokenId does not match the expected value")
      })

    })

    // Check burn() for success when redeemer is trying to burn its own token
    describe("burn()", async () => {
      beforeEach(async function () {
        await instance.mintWithTokenURI(redeemer, "ipfs.json", {from:owner})
        await instance.mintWithTokenURI(redeemer, "ipfs.json", {from:owner})
        const tokenId = await instance.tokenOfOwnerByIndex(redeemer, index1, {from:random})
        await instance.burn(tokenId, {from:redeemer})
      });

      it("removes that token from the token list of the owner", async () => {
        const tokenId = await instance.tokenOfOwnerByIndex(redeemer, index1, {from:random})
        assert.equal(tokenId, "1", "tokenId does not match the expected value" )
      })

      it("adjusts all tokens list", async () => {
        const tokenId = await instance.tokenByIndex(index1, {from:random})
        assert.equal(tokenId, "1", "tokenId does not match expected value")
      })

      it("burns all tokens", async () => {
        await instance.burn("1", {from:redeemer})
        const totSupply = await instance.totalSupply({from:random})
        assert.equal(totSupply, "0", "totSupply does not match expected value")
        await catchRevert(instance.tokenByIndex(index1, {from:random}))
      })

    })

    // Check ERC721 metadata
    describe("ERC721 metadata", async () => {

      it("has a name", async () => {
        const result = await instance.name({from:random})
        assert.equal(result, nameNFT, "name does not match the expected value" )
      })

      it("has a symbol", async () => {
        const result = await instance.symbol({from:random})
        assert.equal(result, symbolNFT, "symbol does not match expected value")
      })

      it("has a baseURI", async () => {
        const result = await instance.baseURI({from:random})
        assert.equal(result, baseURI, "baseURI does not match expected value")
      })

      it("return a baseURI + tokenURI for tokenId", async () => {
        await instance.mintWithTokenURI(redeemer, "ipfs.json", {from:owner})
        const result = await instance.tokenURI("0", {from:random})
        assert.equal(result, "https://badges.makerdao.com/token/ipfs.json", "tokenURI does not match expected value")
      })

      it("reverts when querying metadata for non existent tokenId", async () => {
        await catchRevert(instance.tokenURI("0",{from:random}))
      })

    })

    // Check override _tranfer() function
    describe("ERC721 override _transfer()", async () => {
      beforeEach(async function () {
        await instance.mintWithTokenURI(redeemer, "ipfs.json", {from:owner})
      });

      it("check transferFrom() for revert", async () => {
        await catchRevert(instance.transferFrom(redeemer, random, "0", {from:random}))
      })

      it("check safeTransferFrom() for revert", async () => {
        await catchRevert(instance.safeTransferFrom(redeemer, random, "0", {from:random}))
      })

    })



      // Check createTemplate() for success when a templater is trying to create a new template
      // Check createTemplate() for sucessfully emit event when the template is created
      // Check createTemplate() for failure when a random address try to create a new template
      describe("createTemplate()", async () => {

        it("templaters should be able to create a template", async () => {
          await instance.createTemplate(name, description, image, {from:owner})
          const result = await instance.getTemplate(templateId, {from:random})
          assert.equal(result[0], name, "the name of the created template does not match the expected value")
          assert.equal(result[1], description, "the description of the created template does not match the expected value")
          assert.equal(result[2], image, "the image of the created template does not match the expected value")
          const templatesCount = await instance.getTemplatesCount({from:random})
          assert.equal(templatesCount, 1, "the number of templates does not match the expected value")
        })

        it("should emit the appropriate event when a template is created", async () => {
          const result = await instance.createTemplate(name, description, image, {from:owner})
          assert.equal(result.logs[0].event, "NewTemplate", "NewTemplate event not emitted, check createTemplate method")
        })

        it("random address should not be able to create a new template", async () => {
          await catchRevert(instance.createTemplate(name, description, image, {from:random}))
        })

      })


   })

})
