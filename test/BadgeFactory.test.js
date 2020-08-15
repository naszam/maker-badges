// BadgeFactory.test.js

const { accounts, contract, web3 } = require('@openzeppelin/test-environment');

const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const  { MerkleTree } = require('./merkleTree.js');

const BadgeFactory = contract.fromArtifact('BadgeFactory');
const MakerBadges = contract.fromArtifact('MakerBadges');

let factory;
let maker;

describe('BadgeFactory', function () {
const [ owner, templater, redeemer, random ] = accounts;


const addresses = [ owner, random, redeemer];
const merkleTree = new MerkleTree(addresses);
const root = merkleTree.getHexRoot();
//console.log(root)
const rootHashes = [root];
const proof = merkleTree.getHexProof(redeemer);
//console.log(proof)

const template_name = 'Beginner'
const template_description = 'Beginner Template'
const template_image = 'badge.png'
const templateId = '0'
const index1 = '0'
const index2 = '1'

const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const TEMPLATER_ROLE = web3.utils.soliditySha3('TEMPLATER_ROLE');
const PAUSER_ROLE = web3.utils.soliditySha3('PAUSER_ROLE');

const name = 'MakerBadges';
const symbol = 'MAKER';
const baseURI = 'https://badges.makerdao.com/token/';
const tokenURI = 'ipfs.js';
const token = 'https://badges.makerdao.com/token/ipfs.js';

const pot = '0xEA190DBDC7adF265260ec4dA6e9675Fd4f5A78bb';
const chief = '0xbBFFC76e94B34F72D96D054b31f6424249c1337d';
const flipper = '0xB40139Ea36D35d0C9F6a2e62601B616F1FfbBD1b';

  beforeEach(async function () {
    maker = await MakerBadges.new(pot, chief, flipper, { from: owner });
    factory = await BadgeFactory.new(maker.address, { from: owner });
  });

  // Check that the owner is set as the deploying address
  // Check that the owner is set as the only admin when the contract is deployed
  // Check that the owner is set as the only templater when the contract is deployed
  // Check that the owner is set as the only pauser when the contract is deployed
  describe('Setup', async function () {

      it('the deployer is the owner', async function () {
          expect(await factory.owner()).to.equal(owner);
      });

      it('owner has the default admin role', async function () {
        expect(await factory.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.be.bignumber.equal('1');
        expect(await factory.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).to.equal(owner);
      });

      it('owner has the templater role', async function () {
        expect(await factory.getRoleMemberCount(TEMPLATER_ROLE)).to.be.bignumber.equal('1');
        expect(await factory.getRoleMember(TEMPLATER_ROLE, 0)).to.equal(owner);
      });

      it('owner has the pauser role', async function () {
        expect(await factory.getRoleMemberCount(PAUSER_ROLE)).to.be.bignumber.equal('1');
        expect(await factory.getRoleMember(PAUSER_ROLE, 0)).to.equal(owner);
      });
  });

  // Check ERC721 metadata
  describe('ERC721 metadata', async function () {

      it('has a name', async function () {
        expect(await factory.name({from:random})).equal(name);
      });

      it('has a symbol', async function () {
        expect(await factory.symbol({from:random})).equal(symbol);
      });

      it('has a baseURI', async function () {
        expect(await factory.baseURI({from:random})).equal(baseURI);
      });

      it('return a baseURI + tokenURI for tokenId', async function () {
        await factory.createTemplate(template_name, template_description, template_image, { from: owner });
        await maker.setRootHashes(rootHashes, { from: owner });
        await factory.activateBadge(proof, templateId, tokenURI, { from: redeemer });
        expect(await factory.tokenURI("0", { from: random })).equal(baseURI + tokenURI);
      });

      it('reverts when querying metadata for non existent tokenId', async function () {
        await expectRevert(factory.tokenURI('0', { from: random }), 'ERC721Metadata: URI query for nonexistent token');
      });
  });
});

/*

  describe("Functions", () => {

  it('return a baseURI + tokenURI for tokenId', async function (done) {
    await factory.createTemplate(template_name, template_description, template_image, { from: owner });
    await maker.setRootHashes(rootHashes, { from: owner });
    await factory.activateBadge(proof, templateId, { from: reedemer });
    expect(await factory.tokenURI("0", { from: random })).equal(baseURI + tokenURI);
    done();
  });


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
*/
