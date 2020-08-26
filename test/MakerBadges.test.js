// test/MakerBadges.test.js

const { accounts, contract, web3 } = require('@openzeppelin/test-environment');

const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const MakerBadges = contract.fromArtifact('MakerBadges');

let maker;

describe('MakerBadges', function () {
const [ owner, admin, redeemer, random ] = accounts;

const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ADMIN_ROLE = web3.utils.soliditySha3('ADMIN_ROLE');
const PAUSER_ROLE = web3.utils.soliditySha3('PAUSER_ROLE');

// https://changelog.makerdao.com/releases/mainnet/1.0.9/contracts.json
const pot = '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7';
const chief = '0x9eF05f7F6deB616fd37aC3c959a2dDD25A54E4F5';
const flipper = '0x0F398a2DaAa134621e4b687FCcfeE4CE47599Cc1';

const exec = '0x7A74Fb6BD364b9b5ef69605a3D28327dA8087AA0';
const flip = '0xF4ba847fa7AB857917C9e714EE723Bed7E915A38';


const templateId = 1;
const bidId = 54;

  // Check that the owner is set as the deploying address
  // Check that the owner is set as the only admin when the contract is deployed
  // Check that the owner is set as the only templater when the contract is deployed
  // Check that the owner is set as the only pauser when the contract is deployed
  beforeEach(async function () {
    maker = await MakerBadges.new(pot, chief, flipper, { from: owner });
  });

  describe('Setup', async function () {

      it('the deployer is the owner', async function () {
        expect(await maker.owner()).to.equal(owner);
      });

      it('owner has the default admin role', async function () {
        expect(await maker.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.be.bignumber.equal('1');
        expect(await maker.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).to.equal(owner);
      });

      it('owner has the admin role', async function () {
        expect(await maker.getRoleMemberCount(ADMIN_ROLE)).to.be.bignumber.equal('1');
        expect(await maker.getRoleMember(ADMIN_ROLE, 0)).to.equal(owner);
      });

      it('owner has the pauser role', async function () {
        expect(await maker.getRoleMemberCount(PAUSER_ROLE)).to.be.bignumber.equal('1');
        expect(await maker.getRoleMember(PAUSER_ROLE, 0)).to.equal(owner);
      });
  });
/*
  describe('potChallenge()', async function () {

      it('caller has accrued one or more dai on pot', async function () {
        await maker.potChallenge(templateId, { from: chai });
        expect(await maker.verify(templateId, chai, {from: random})).to.equal(true);
      });

      it('should emit the appropriate event when pot is checked', async function () {
        const receipt = await maker.potChallenge(templateId, { from: chai });
        expectEvent(receipt, 'PotChecked', { guy: chai });
      });

      it('random address should not be able to pass the challenge', async function () {
        await expectRevert(maker.potChallenge(templateId, { from: random }), 'Caller has not accrued 1 or more Dai interest on Pot');
      });
  });
*/
  // Check chiefChallenge() for success when a caller is voting in an executive spell
  // Check chiefChallenge() for sucessfully emit event when the caller is checked for chief
  // Check chiefChallenge() for failure when a random address is not voting in an executive spell
  describe('chiefChallenge()', async function () {

      it('caller is voting in an executive spell', async function () {
        await maker.chiefChallenge(templateId, { from: exec });
        expect(await maker.verify(templateId, exec, {from: random})).to.equal(true);
      });

      it('should emit the appropriate event when the caller is checked for chief', async function () {
        const receipt = await maker.chiefChallenge(templateId, { from: exec });
        expectEvent(receipt, 'DSChiefChecked', { guy: exec });
      });

      it('random address should not be able to pass the challenge', async function () {
        await expectRevert(maker.chiefChallenge(templateId, { from: random }), 'Caller is not voting in an Executive Spell');
      });
  });

  // Check flipperChallenge() for success when a caller is the high bidder in the current bid in eth collateral auctions
  // Check flipperChallenge() for sucessfully emit event when the caller is checked for flipper
  // Check flipperChallenge() for failure when a random address is not the high bidder in the current bid in eth collateral auctions
  describe('flipperChallenge()', async function () {

      it('caller is the high bidder in the current bid in eth collateral auctions', async function () {
        await maker.flipperChallenge(templateId, bidId, { from: flip });
        expect(await maker.verify(templateId, flip, {from: random})).to.equal(true);
      });

      it('should emit the appropriate event when flipper is checked', async function () {
        const receipt = await maker.flipperChallenge(templateId, bidId, { from: flip });
        expectEvent(receipt, 'FlipperChecked', { guy: flip });
      });

      it('random address should not be able to pass the challenge', async function () {
        await expectRevert(maker.flipperChallenge(templateId, bidId, { from: random }), 'Caller is not the high bidder in the current Bid in ETH Collateral Auctions');
      });
  });

  // Check addAdmin() for success when the default admin is adding a new admin
  // Check addAdmin() for sucessfully emit event when the admin is added
  // Check addAdmin() for failure when a random address try to add a new admin
  describe('addAdmin()', async function () {

      it('default admin should be able to add an admin', async function () {
        await maker.addAdmin(admin, { from: owner });
        expect(await maker.hasRole(ADMIN_ROLE, admin)).to.equal(true);
      });

      it('should emit the appropriate event when a new admin is added', async function () {
        const receipt = await maker.addAdmin(admin, { from: owner });
        expectEvent(receipt, 'RoleGranted', { account: admin });
      });

      it('random address should not be able to add a new admin', async function () {
        await expectRevert(maker.addAdmin(admin, { from: random }), 'Caller is not the default admin');
      });
  });

  // Check removeAdmin() for success when the default admin is removing an admin
  // Check removeAdmin() for sucessfully emit event when the admin is removed
  // Check removeAdmin() for failure when a random address try to remove an admin
  describe('removeAdmin()', async function () {

      beforeEach(async function () {
        await maker.addAdmin(admin, { from: owner });
      });

      it('default admin should be able to remove a templater', async function () {
        await maker.removeAdmin(admin, { from: owner });
        expect(await maker.hasRole(ADMIN_ROLE, admin)).to.equal(false)
      });

      it('should emit the appropriate event when an admin is removed', async function () {
        const receipt = await maker.removeAdmin(admin, { from: owner });
        expectEvent(receipt, 'RoleRevoked', { account: admin });
      });

      it('random address should not be able to remove an admin', async function () {
        await expectRevert(maker.removeAdmin(admin, { from: random }), 'Caller is not the default admin');
      });
  });

  // Check pause() for success when the pauser is pausing all the functions
  // Check pause() for sucessfully emit event when the functions are paused
  // Check pause() for failure when a random address try to pause all the functions
  describe('pause()', async function () {

      it('owner can pause', async function () {
        const receipt = await maker.pause({ from: owner });
        expect(await maker.paused()).to.equal(true);
      })

      it('should emit the appropriate event when the functions are paused', async function () {
        const receipt = await maker.pause({ from: owner });
        expectEvent(receipt, 'Paused', { account: owner });
      });

      it('random accounts cannot pause', async function () {
        await expectRevert(maker.pause({ from: random }), 'MakerBadges: must have pauser role to pause');
      });
  });

  // Check unpause() for success when the pauser is unpausing all the functions
  // Check unpause() for sucessfully emit event when the functions are unpaused
  // Check unpause() for failure when a random address try to unpause all the functions
  describe('unpause()', async function () {

      it('owner can unpause', async function () {
        await maker.pause({ from: owner });
        const receipt = await maker.unpause({ from: owner });
        expect(await maker.paused()).to.equal(false);
      });

      it('should emit the appropriate event when all functions are unpaused', async function () {
        await maker.pause({ from: owner });
        const receipt = await maker.unpause({ from: owner });
        expectEvent(receipt, 'Unpaused', { account: owner });
      });

      it('random accounts cannot unpause', async function () {
        await expectRevert(maker.unpause({ from: random }), 'MakerBadges: must have pauser role to unpause');
      });
  });
});
