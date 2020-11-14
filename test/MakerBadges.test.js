// test/MakerBadges.test.js

const { accounts, contract, web3 } = require('@openzeppelin/test-environment');

const { expectEvent, expectRevert, send, constants } = require('@openzeppelin/test-helpers');

const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const MakerBadges = contract.fromArtifact('MakerBadges');

let maker;

describe('MakerBadges', function () {
const [ owner, redeemer, random ] = accounts;

const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const PAUSER_ROLE = web3.utils.soliditySha3('PAUSER_ROLE');

// https://etherscan.io/address/0x06AF07097C9Eeb7fD685c692751D5C66dB49c215
const chai = '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215';

// https://changelog.makerdao.com/releases/mainnet/1.1.1/contracts.json
const chief = '0x9eF05f7F6deB616fd37aC3c959a2dDD25A54E4F5';
const flipper = '0xF32836B9E1f47a0515c6Ec431592D5EbC276407f';
const proxy = '0x0b65234703A6c2957fCFaff30531ABBabF581C8e';
const proxy2 = '0x5F0976545aA52dC18e6d07b14Edae2D811708105';

// mainnet redeemer addresses
const usr = '0xA25e31D8e4ED3e959898a089Dc2624F14a7fB738';
const exec = '0x7A74Fb6BD364b9b5ef69605a3D28327dA8087AA0';
const exec_proxy = '0xB190BC922e8fbEc4DD673deE6C0D86F0e4B73f09';
const exec_proxy2 = '0xAc75b73394C329376c214663D92156AfA864a77f';
const flip = '0xF3d18dB1B4900bAd51b6106F757515d1650A5894';

const templateId = 1;
const bidId = 52;

  // Check that the owner is set as the deploying address
  // Check that the owner is set as the only admin when the contract is deployed
  // Check that the owner is set as the only templater when the contract is deployed
  // Check that the owner is set as the only pauser when the contract is deployed
  beforeEach(async function () {
    maker = await MakerBadges.new(chai, chief, flipper, { from: owner });
  });

  describe('Setup', async function () {

      it('owner has the default admin role', async function () {
        expect(await maker.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.be.bignumber.equal('1');
        expect(await maker.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).to.equal(owner);
      });

      it('owner has the pauser role', async function () {
        expect(await maker.getRoleMemberCount(PAUSER_ROLE)).to.be.bignumber.equal('1');
        expect(await maker.getRoleMember(PAUSER_ROLE, 0)).to.equal(owner);
      });
  });

  // Check Fallback function
  describe('fallback()', async function () {

      it('should revert when sending ether to contract address', async function () {
        await expectRevert.unspecified(send.ether(owner, maker.address, 1));
      });
  });

  // Check chiefChallenge() for success when a caller has accrued 1 or more Dai interest on Pot
  // Check chiefChallenge() for sucessfully emit event when the caller is checked for chai
  // Check chiefChallenge() for failure when a random address has not accrued 1 or more Dai interest on Pot
  describe('chaiChallenge()', async function () {

      it('caller has accrued one or more dai on pot', async function () {
        await maker.chaiChallenge(templateId, { from: usr });
        expect(await maker.verify(templateId, usr, {from: random})).to.equal(true);
      });

      it('should emit the appropriate event when chai is checked', async function () {
        const receipt = await maker.chaiChallenge(templateId, { from: usr });
        expectEvent(receipt, 'ChaiChecked', { usr: usr });
      });

      it('random address should not be able to pass the challenge', async function () {
        await expectRevert(maker.chaiChallenge(templateId, { from: random }), 'MakerBadges: caller has not accrued 1 or more dai interest on pot');
      });
  });

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
        await expectRevert(maker.chiefChallenge(templateId, { from: random }), 'MakerBadges: caller is not voting in an executive spell');
      });
  });

  // Check robotChallenge() for success when a caller is voting in an executive spell via vote proxy
  // Check robotChallenge() for sucessfully emit event when the caller is checked for robot chief
  // Check robotChallenge() for failure when a random address is not voting in an executive spell via proxy
  // Check robotChallenge() for failure when a proxy user pass zero address as proxy address
  describe('robotChallenge()', async function () {

      it('caller is voting in an executive spell via proxy', async function () {
        await maker.robotChallenge(templateId, proxy, { from: exec_proxy });
        expect(await maker.verify(templateId, exec_proxy, {from: random})).to.equal(true);
      });

      it('caller is voting in an executive spell via proxy2', async function () {
        await maker.robotChallenge(templateId, proxy2, { from: exec_proxy2 });
        expect(await maker.verify(templateId, exec_proxy2, {from: random})).to.equal(true);
      });

      it('should emit the appropriate event when the proxy caller is checked for chief', async function () {
        const receipt = await maker.robotChallenge(templateId, proxy, { from: exec_proxy });
        expectEvent(receipt, 'RobotChecked', { guy: exec_proxy });
      });

      it('should emit the appropriate event when the proxy2 caller is checked for chief', async function () {
        const receipt = await maker.robotChallenge(templateId, proxy2, { from: exec_proxy2 });
        expectEvent(receipt, 'RobotChecked', { guy: exec_proxy2 });
      });

      it('random address should not be able to pass the robot challenge', async function () {
        await expectRevert(maker.robotChallenge(templateId, proxy, { from: random }), 'MakerBadges: caller is not voting via proxy in an executive spell');
      });

      it('should revert by passing address zero as proxy when called by proxy user', async function () {
        await expectRevert(maker.robotChallenge(templateId, ZERO_ADDRESS, { from: exec_proxy }), 'MakerBadges: caller is not voting via proxy in an executive spell');
      });
  });

/* In order to test flipper check https://changelog.makerdao.com/releases/mainnet/latest/ and set bidId to last kick (before deal) and unlock high bidder (guy) address

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
        await expectRevert(maker.flipperChallenge(templateId, bidId, { from: random }), 'MakerBadges: caller is not the high bidder in the current bid in ETH collateral auctions');
      });
  });

*/

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
