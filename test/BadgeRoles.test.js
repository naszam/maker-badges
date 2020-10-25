// test/BadgeRoles.test.js

const { accounts, contract, web3 } = require('@openzeppelin/test-environment');

const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const BadgeRoles = contract.fromArtifact('BadgeRoles');

let roles;

describe('BadgeRoles', function () {
const [ owner, templater, random ] = accounts;

const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ADMIN_ROLE = web3.utils.soliditySha3('ADMIN_ROLE');
const TEMPLATER_ROLE = web3.utils.soliditySha3('TEMPLATER_ROLE');
const PAUSER_ROLE = web3.utils.soliditySha3('PAUSER_ROLE');

  // Check that the owner is set as the deploying address
  // Check that the owner is set as the only admin when the contract is deployed
  // Check that the owner is set as the only templater when the contract is deployed
  // Check that the owner is set as the only pauser when the contract is deployed
  beforeEach(async function () {
    roles = await BadgeRoles.new({ from: owner });
  });

  describe('Setup', async function () {

      it('owner has the default admin role', async function () {
        expect(await roles.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.be.bignumber.equal('1');
        expect(await roles.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).to.equal(owner);
      });

      it('owner has the admin role', async function () {
        expect(await roles.getRoleMemberCount(ADMIN_ROLE)).to.be.bignumber.equal('1');
        expect(await roles.getRoleMember(ADMIN_ROLE, 0)).to.equal(owner);
      });

      it('owner has the templater role', async function () {
        expect(await roles.getRoleMemberCount(TEMPLATER_ROLE)).to.be.bignumber.equal('1');
        expect(await roles.getRoleMember(TEMPLATER_ROLE, 0)).to.equal(owner);
      });

      it('owner has the pauser role', async function () {
        expect(await roles.getRoleMemberCount(PAUSER_ROLE)).to.be.bignumber.equal('1');
        expect(await roles.getRoleMember(PAUSER_ROLE, 0)).to.equal(owner);
      });
  });

  // Check pause() for success when the pauser is pausing all the functions
  // Check pause() for sucessfully emit event when the functions are paused
  // Check pause() for failure when a random address try to pause all the functions
  describe('pause()', async function () {

      it('owner can pause', async function () {
        const receipt = await roles.pause({ from: owner });
        expect(await roles.paused()).to.equal(true);
      })

      it('should emit the appropriate event when the functions are paused', async function () {
        const receipt = await roles.pause({ from: owner });
        expectEvent(receipt, 'Paused', { account: owner });
      });

      it('random accounts cannot pause', async function () {
        await expectRevert(roles.pause({ from: random }), 'BadgeFactory: must have pauser role to pause');
      });
  });

  // Check unpause() for success when the pauser is unpausing all the functions
  // Check unpause() for sucessfully emit event when the functions are unpaused
  // Check unpause() for failure when a random address try to unpause all the functions
  describe('unpause()', async function () {

      it('owner can unpause', async function () {
        await roles.pause({ from: owner });
        const receipt = await roles.unpause({ from: owner });
        expect(await roles.paused()).to.equal(false);
      });

      it('should emit the appropriate event when all functions are unpaused', async function () {
        await roles.pause({ from: owner });
        const receipt = await roles.unpause({ from: owner });
        expectEvent(receipt, 'Unpaused', { account: owner });
      });

      it('random accounts cannot unpause', async function () {
        await expectRevert(roles.unpause({ from: random }), 'BadgeFactory: must have pauser role to unpause');
      });
  });
});
