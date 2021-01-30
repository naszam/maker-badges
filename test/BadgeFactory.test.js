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
//accounts.push('0xF5f7393dbE345f566b5A6580c2455Bdcdd134A95');

const merkleTree = new MerkleTree(accounts);
const root = merkleTree.getHexRoot();
//console.log(root)
const rootHashes = ['0x00', '0x00', '0x00', '0x00', root];
const proof = merkleTree.getHexProof(redeemer);
//console.log(proof)

const template_name = 'Beginner';
const template_description = 'Beginner Template';
const template_image = 'badge.png';
const template_name2 = "Intermediate";
const template_description2 = "Intermediate Template";
const template_image2 = "badge2.png";
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

// https://etherscan.io/address/0x06AF07097C9Eeb7fD685c692751D5C66dB49c215
const chai = '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215';

// https://changelog.makerdao.com/releases/mainnet/1.1.1/contracts.json
const chief = '0x0a3f6849f78076aefaDf113F5BED87720274dDC0';
const flipper = '0xF32836B9E1f47a0515c6Ec431592D5EbC276407f';

// https://vote.makerdao.com/executive/increase-eth-a-usdc-a-psm-usdc-a-debt-ceilings?network=mainnet#proposal-detail
const proxy = '0xb78fe03167d68Adc890B91D67BA21DE02265CE15';
const proxy2 = '0xC54C3691419c2996eB6e76B421E7f1132ab0Ee7A';

// mainnet redeemer addresses
const usr = '0xA25e31D8e4ED3e959898a089Dc2624F14a7fB738';
const exec = '0x1eaD7050c94C8A1f08071ddBb28b01b3eB1B3D38';
const exec_proxy = '0x6a3000945173AD8905C70FdA700EbBE1C41EAB40';
const exec_proxy2 = '0xa6055F63ea1Cf238e6FD00e4D3810141ebF3ec2D';
const flip = '0xF3d18dB1B4900bAd51b6106F757515d1650A5894';

const chaiId = '0';
const chiefId = '1';
const robotId = '2';
const flipperId = '3';
const offchainId = '4';
const bidId = 52;

  beforeEach(async function () {
    maker = await MakerBadges.new(chai, chief, flipper, { from: owner });
    factory = await BadgeFactory.new(maker.address, { from: owner });
  });

  // Check that the owner is set as the deploying address
  // Check that the owner is set as the only admin when the contract is deployed
  // Check that the owner is set as the only templater when the contract is deployed
  // Check that the owner is set as the only pauser when the contract is deployed
  describe('Setup', async function () {

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
        await maker.chaiChallenge({ from: usr });
        await factory.activateBadge(proof, chaiId, tokenURI, { from: usr });
        const tokenId = await factory.tokenOfOwnerByIndex(usr, index1, { from: random });
        expect(await factory.tokenURI(tokenId, { from: random })).equal(baseURI + tokenURI);
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
        await expectRevert(factory.createTemplate(template_name, template_description, template_image, { from: random }), 'BadgeFactory: caller is not a template owner');
      });
  });

  // Check updateTemplate() for success when a templater try to update a template
  // Check updateTemplate() for sucessfully emit event when the template is updated
  // Check updateTemplate() for failure when a random address try to update a template
  describe('updateTemplate()', async function () {

      beforeEach(async function () {
        await factory.createTemplate(template_name, template_description, template_image, { from: owner });
      });

      it('templaters should be able to update a template', async function () {
        await factory.updateTemplate(templateId, template_name2, template_description2, template_image2, { from: owner });
        const receipt = await factory.getTemplate(templateId, { from: random });
        expect(receipt[0]).equal(template_name2);
        expect(receipt[1]).equal(template_description2);
        expect(receipt[2]).equal(template_image2);
        expect(await factory.getTemplatesCount({ from: random })).to.be.bignumber.equal('1');
      });

      it('should emit the appropriate event when a template is updated', async function () {
        const receipt = await factory.updateTemplate(templateId, template_name2, template_description2, template_image2, { from: owner });
        expectEvent(receipt, 'TemplateUpdated', { templateId: templateId, name: template_name2, description: template_description2, image: template_image2 });
      });

      it('random address should not be able to update a template', async function () {
        await expectRevert(factory.updateTemplate(templateId, template_name2, template_description2, template_image2, { from: random }), 'BadgeFactory: caller is not a template owner');
      });
  });

  // Check activateBadge() for success when a redeemer checked offchain activate a badge
  // Check activateBadge() for sucessfully emit event when the badge is activated
  // Check activateBadge() for failure when a random address try to activate a badge
  describe('activateBadge()', async function () {

      beforeEach(async function () {
        await factory.createTemplate(template_name, template_description, template_image, { from: owner });
        await factory.createTemplate(template_name, template_description, template_image, { from: owner });
        await factory.createTemplate(template_name, template_description, template_image, { from: owner });
        await factory.createTemplate(template_name, template_description, template_image, { from: owner });
        await factory.createTemplate(template_name, template_description, template_image, { from: owner });
        await factory.setRootHashes(rootHashes, { from: owner });
      });

      it('should allow redeemers checked onchain for chai to activate a badge', async function () {
        await maker.chaiChallenge({ from: usr });
        await factory.activateBadge(proof, chaiId, tokenURI, { from: usr });
        const tokenId = await factory.tokenOfOwnerByIndex(usr, index1, { from: random });
        expect(await factory.getBadgeRedeemer(tokenId), {from: random }).to.be.bignumber.equal(usr);
        expect(await factory.getBadgeTemplate(tokenId), {from: random }).to.be.bignumber.equal(chaiId);
        expect(await factory.getBadgeTemplateQuantity(chaiId, { from: random })).to.be.bignumber.equal('1');
      });

      it('should allow redeemers checked onchain for chief to activate a badge', async function () {
        await maker.chiefChallenge({ from: exec });
        await factory.activateBadge(proof, chiefId, tokenURI, { from: exec });
        const tokenId = await factory.tokenOfOwnerByIndex(exec, index1, { from: random });
        expect(await factory.getBadgeRedeemer(tokenId), {from: random }).to.be.bignumber.equal(exec);
        expect(await factory.getBadgeTemplate(tokenId), {from: random }).to.be.bignumber.equal(chiefId);
        expect(await factory.getBadgeTemplateQuantity(chiefId, { from: random })).to.be.bignumber.equal('1');
      });

      it('should allow redeemers checked onchain for robot via proxy to activate a badge', async function () {
        await maker.robotChallenge(proxy, { from: exec_proxy });
        await factory.activateBadge(proof, robotId, tokenURI, { from: exec_proxy });
        const tokenId = await factory.tokenOfOwnerByIndex(exec_proxy, index1, { from: random });
        expect(await factory.getBadgeRedeemer(tokenId), {from: random }).to.be.bignumber.equal(exec_proxy);
        expect(await factory.getBadgeTemplate(tokenId), {from: random }).to.be.bignumber.equal(robotId);
        expect(await factory.getBadgeTemplateQuantity(robotId, { from: random })).to.be.bignumber.equal('1');
      });

      it('should allow redeemers checked onchain for robot via proxy2 to activate a badge', async function () {
        await maker.robotChallenge(proxy2, { from: exec_proxy2 });
        await factory.activateBadge(proof, robotId, tokenURI, { from: exec_proxy2 });
        const tokenId = await factory.tokenOfOwnerByIndex(exec_proxy2, index1, { from: random });
        expect(await factory.getBadgeRedeemer(tokenId), {from: random }).to.be.bignumber.equal(exec_proxy2);
        expect(await factory.getBadgeTemplate(tokenId), {from: random }).to.be.bignumber.equal(robotId);
        expect(await factory.getBadgeTemplateQuantity(robotId, { from: random })).to.be.bignumber.equal('1');
      });

/* In order to test flipper check https://changelog.makerdao.com/releases/mainnet/latest/ and set bidId to last kick (before deal) and unlock high bidder (guy) address
      it('should allow redeemers checked onchain for flipper to activate a badge', async function () {
        await maker.flipperChallenge(bidId, { from: flip });
        await factory.activateBadge(proof, flipperId, tokenURI, { from: flip });
        const tokenId = await factory.tokenOfOwnerByIndex(flip, index1, { from: random });
        expect(await factory.getBadgeRedeemer(tokenId), {from: random }).to.be.bignumber.equal(flip);
        expect(await factory.getBadgeTemplate(tokenId), {from: random }).to.be.bignumber.equal(flipperId);
        expect(await factory.getBadgeTemplateQuantity(flipperId, { from: random })).to.be.bignumber.equal('1');
      });
*/
      it('should allow redeemers checked offchain to activate a badge', async function () {
        await factory.activateBadge(proof, offchainId, tokenURI, { from: redeemer });
        const tokenId = await factory.tokenOfOwnerByIndex(redeemer, index1, { from: random });
        expect(await factory.getBadgeRedeemer(tokenId), {from: random }).to.be.bignumber.equal(redeemer);
        expect(await factory.getBadgeTemplate(tokenId), {from: random }).to.be.bignumber.equal(offchainId);
        expect(await factory.getBadgeTemplateQuantity(offchainId, { from: random })).to.be.bignumber.equal('1');
      });

      it('should emit the appropriate event when a badge is activated', async function () {
        const receipt = await factory.activateBadge(proof, offchainId, tokenURI, { from: redeemer });
        const tokenId = await factory.tokenOfOwnerByIndex(redeemer, index1, { from: random });
        expectEvent(receipt, 'BadgeActivated', { tokenId: tokenId, templateId: offchainId, tokenURI: tokenURI });
        expectEvent(receipt, 'Transfer', { from: ZERO_ADDRESS, to: redeemer, tokenId: tokenId });
      });

      it("should revert when templeteId does not exist", async () => {
        await expectRevert(factory.activateBadge(proof, offchainId+1, tokenURI, { from: redeemer }), 'BadgeFactory: no template with that id');
      });

      it("random address should not be able to activate a new badge", async () => {
        await expectRevert(factory.activateBadge(proof, offchainId, tokenURI, { from: random }), 'BadgeFactory: caller is not a redeemer');
      });

      it("redeemer should not be able to activate the same badge twice", async () => {
        await factory.activateBadge(proof, offchainId, tokenURI, { from: redeemer });
        await expectRevert(factory.activateBadge(proof, offchainId, tokenURI, { from: redeemer}), 'ERC721: token already minted');
      });
  });

  // Check override _tranfer() function
  describe('ERC721 override _transfer()', async function () {
      beforeEach(async function () {
        await factory.createTemplate(template_name, template_description, template_image, { from: owner });
        await maker.chaiChallenge({ from: usr });
        await factory.activateBadge(proof, chaiId, tokenURI, { from: usr });
      });

      it('check transferFrom() for revert', async function () {
        const tokenId = await factory.tokenOfOwnerByIndex(usr, index1, { from: random });
        await expectRevert(factory.transferFrom(usr, random, tokenId, {from:usr}), 'BadgeFactory: badge transfer disabled');
      });

      it('check safeTransferFrom() for revert', async function () {
        const tokenId = await factory.tokenOfOwnerByIndex(usr, index1, { from: random });
        await expectRevert(factory.safeTransferFrom(usr, random, tokenId, {from:usr}), 'BadgeFactory: badge transfer disabled');
      });
  });

});
