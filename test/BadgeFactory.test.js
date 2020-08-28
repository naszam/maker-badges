// BadgeFactory.test.js

const { accounts, contract, web3 } = require('@openzeppelin/test-environment');

const { expectEvent, expectRevert, constants, send } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

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

const template_name = 'Beginner';
const template_description = 'Beginner Template';
const template_image = 'badge.png';
const templateId = '0';
const index1 = '0';
const index2 = '1';

const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const TEMPLATER_ROLE = web3.utils.soliditySha3('TEMPLATER_ROLE');
const PAUSER_ROLE = web3.utils.soliditySha3('PAUSER_ROLE');

const name = 'MakerBadges';
const symbol = 'MAKER';
const baseURI = 'https://badges.makerdao.com/token/';
const baseURI2 = 'https://badegs.com/token/';
const tokenURI = 'ipfs.js';

// https://changelog.makerdao.com/releases/mainnet/1.0.9/contracts.json
const pot = '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7';
const chief = '0x9eF05f7F6deB616fd37aC3c959a2dDD25A54E4F5';
const flipper = '0x0F398a2DaAa134621e4b687FCcfeE4CE47599Cc1';

const exec = '0x7A74Fb6BD364b9b5ef69605a3D28327dA8087AA0';
const flip = '0xF4ba847fa7AB857917C9e714EE723Bed7E915A38';

const bidId = 54;

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

  // Check Fallback function
  describe('fallback()', async function () {

      it('should revert when sending ether to contract address', async function () {
        await expectRevert.unspecified(send.ether(owner, factory.address, 1));
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

      it('return an updated baseURI', async function () {
        await factory.setBaseURI(baseURI2, { from: owner });
        expect(await factory.baseURI({from:random})).equal(baseURI2);
      });

      it('reverts when querying metadata for non existent tokenId', async function () {
        await expectRevert(factory.tokenURI('0', { from: random }), 'ERC721Metadata: URI query for nonexistent token');
      });
  });


  // Check createTemplate() for success when a templater is trying to create a new template
  // Check createTemplate() for sucessfully emit event when the template is created
  // Check createTemplate() for failure when a random address try to create a new template
  describe('createTemplate()', async function () {

      it('templater should be able to create a template', async function () {
        await factory.createTemplate(template_name, template_description, template_image, { from: owner });
        const receipt = await factory.getTemplate(templateId, { from: random });
        expect(receipt[0]).equal(template_name);
        expect(receipt[1]).equal(template_description);
        expect(receipt[2]).equal(template_image);
        expect(await factory.getTemplatesCount({ from: random })).to.be.bignumber.equal('1');
      })

      it('should emit the appropriate event when a template is created', async function () {
        const receipt = await factory.createTemplate(template_name, template_description, template_image, { from: owner });
        expectEvent(receipt, 'NewTemplate', { templateId: templateId, name: template_name, description: template_description, image: template_image });
      });

      it("random address should not be able to create a new template", async () => {
        await expectRevert(factory.createTemplate(template_name, template_description, template_image, { from: random }), 'Caller is not a template owner');
      });
  });

  // Check activateBadge() for success when a redeemer checked offchain activate a badge
  // Check activateBadge() for sucessfully emit event when the badge is activated
  // Check activateBadge() for failure when a random address try to activate a badge
  describe('activateBadge()', async function () {

    beforeEach(async function () {
      await factory.createTemplate(template_name, template_description, template_image, { from: owner });
      await maker.setRootHashes(rootHashes, { from: owner });
    });

      it('should allow redeemers checked onchain for flipper to activate a badge', async function () {
        await maker.flipperChallenge(templateId, bidId, { from: flip });
        await factory.activateBadge(proof, templateId, tokenURI, { from: flip });
        const tokenId = await factory.tokenOfOwnerByIndex(flip, index1, { from: random });
        expect(await factory.getBadgeTemplate(tokenId), {from: random }).to.be.bignumber.equal(templateId);
        expect(await factory.getBadgeTemplateQuantity(templateId, { from: random })).to.be.bignumber.equal('1');
      })

      it('should allow redeemers checked onchain for chief to activate a badge', async function () {
        await maker.chiefChallenge(templateId, { from: exec });
        await factory.activateBadge(proof, templateId, tokenURI, { from: exec });
        const tokenId = await factory.tokenOfOwnerByIndex(exec, index1, { from: random });
        expect(await factory.getBadgeTemplate(tokenId), {from: random }).to.be.bignumber.equal(templateId);
        expect(await factory.getBadgeTemplateQuantity(templateId, { from: random })).to.be.bignumber.equal('1');
      })

      it('should allow redeemers checked offchain to activate a badge', async function () {
        await factory.activateBadge(proof, templateId, tokenURI, { from: redeemer });
        const tokenId = await factory.tokenOfOwnerByIndex(redeemer, index1, { from: random });
        expect(await factory.getBadgeTemplate(tokenId), {from: random }).to.be.bignumber.equal(templateId);
        expect(await factory.getBadgeTemplateQuantity(templateId, { from: random })).to.be.bignumber.equal('1');
      })

      it('should emit the appropriate event when a badge is activated', async function () {
        const receipt = await factory.activateBadge(proof, templateId, tokenURI, { from: redeemer });
        expectEvent(receipt, 'BadgeActivated', { redeemer: redeemer, templateId: templateId, tokenURI: tokenURI });
      });

      it("should revert when templeteId does not exist", async () => {
        await expectRevert(factory.activateBadge(proof, templateId+1, tokenURI, { from: redeemer }), 'No template with that id');
      });

      it("random address should not be able to activate a new badge", async () => {
        await expectRevert(factory.activateBadge(proof, templateId, tokenURI, { from: random }), 'Caller is not a redeemer');
      });

      it("redeemer should not be able to activate the same badge twice", async () => {
        await factory.activateBadge(proof, templateId, tokenURI, { from: redeemer });
        await expectRevert(factory.activateBadge(proof, templateId, tokenURI, { from: redeemer}), 'Badge already activated!');
      });
  });

  // Check burnBadge() for success when a badge owner try to burn the badge
  // Check burnBadge() for sucessfully emit event when the badge is burned
  // Check burnBadge() for failure when a random address try to burn a badge
  describe('burnBadge()', async function () {

      beforeEach(async function () {
        await factory.createTemplate(template_name, template_description, template_image, { from: owner });
        await maker.setRootHashes(rootHashes, { from: owner });
        await factory.activateBadge(proof, templateId, tokenURI, { from: redeemer });
      });

      it('badge owners should be able to burn a badge', async function () {
        const tokenId = await factory.tokenOfOwnerByIndex(redeemer, index1, { from: random });
        await factory.burnBadge(tokenId, { from: redeemer });
        expect(await factory.getBadgeTemplateQuantity(templateId, { from: random })).to.be.bignumber.equal('0');
        expect(await factory.totalSupply({ from: random })).to.be.bignumber.equal('0');
      });

      it('should emit the appropriate event when a badge is burned', async function () {
        const tokenId = await factory.tokenOfOwnerByIndex(redeemer, index1, { from: random });
        const receipt = await factory.burnBadge(tokenId, { from: redeemer });
        expectEvent(receipt, 'Transfer', { from: redeemer, to: ZERO_ADDRESS, tokenId: tokenId });
      });

      it('random address should not be able to burn a badge', async function () {
        const tokenId = await factory.tokenOfOwnerByIndex(redeemer, index1, { from: random });
        await expectRevert(factory.burnBadge(tokenId, { from: random }), 'ERC721Burnable: caller is not owner nor approved');
      });
  });

  // Check override _tranfer() function
  describe('ERC721 override _transfer()', async function () {
      beforeEach(async function () {
        await factory.createTemplate(template_name, template_description, template_image, { from: owner });
        await maker.setRootHashes(rootHashes, { from: owner });
        await factory.activateBadge(proof, templateId, tokenURI, { from: redeemer });
      });

      it('check transferFrom() for revert', async function () {
        const tokenId = await factory.tokenOfOwnerByIndex(redeemer, index1, { from: random });
        await expectRevert(factory.transferFrom(redeemer, random, tokenId, {from:redeemer}), 'ERC721: token transfer disabled');
      });

      it('check safeTransferFrom() for revert', async function () {
        const tokenId = await factory.tokenOfOwnerByIndex(redeemer, index1, { from: random });
        await expectRevert(factory.safeTransferFrom(redeemer, random, tokenId, {from:redeemer}), 'ERC721: token transfer disabled');
      });
  });

});
