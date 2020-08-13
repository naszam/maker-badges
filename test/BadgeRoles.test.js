// test/BadgeRoles.test.js

const { accounts, contract, web3 } = require('@openzeppelin/test-environment');

const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const BadgeRoles = contract.fromArtifact('BadgeRoles');

let roles;

describe('BadgeRoles', function () {
const [ owner, templater, random ] = accounts;

const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const PAUSER_ROLE = web3.utils.soliditySha3('PAUSER_ROLE');
const TEMPLATER_ROLE = web3.utils.soliditySha3('TEMPLATER_ROLE');

  beforeEach(async function () {
    roles = await BadgeRoles.new({ from: owner });
  });

  it('the deployer is the owner', async function () {
    expect(await roles.owner()).to.equal(owner);
  });

  it('owner has the default admin role', async function () {
    expect(await roles.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.be.bignumber.equal('1');
    expect(await roles.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).to.equal(owner);
  });

  it('owner has the pauser role', async function () {
    expect(await roles.getRoleMemberCount(PAUSER_ROLE)).to.be.bignumber.equal('1');
    expect(await roles.getRoleMember(PAUSER_ROLE, 0)).to.equal(owner);
  });

  // Check addTemplater() for success when an admin is adding a new templater
  // Check addTemplater() for sucessfully emit event when the templater is added
  // Check addTemplater() for failure when a random address try to add a templater
  describe('addTemplater()', async function () {

      it('admin should be able to add a templater', async function () {
        await roles.addTemplater(templater, { from: owner });
        expect(await roles.hasRole(TEMPLATER_ROLE, templater)).to.equal(true);
      });

      it('should emit the appropriate event when a new templater is added', async function () {
        const receipt = await roles.addTemplater(templater, { from: owner });
        expectEvent(receipt, 'RoleGranted', { account: templater });
      });

      it('random address should not be able to add a new templater', async function () {
        await expectRevert(roles.addTemplater(templater, { from: random }), 'Caller is not an admin')
      });
  });

  // Check removeTemplater() for success when an admin is removing a new templater
  // Check removeTemplater() for sucessfully emit event when the templater is removed
  // Check removeTemplater() for failure when a random address try to remove a templater
  describe('removeTemplater()', async function () {

      beforeEach(async function () {
        await roles.addTemplater(templater, { from: owner });
      });

      it('admin should be able to remove a templater', async function () {
        await roles.removeTemplater(templater, { from: owner });
        expect(await roles.hasRole(TEMPLATER_ROLE, templater)).to.equal(false)
      });

      it('should emit the appropriate event when a templater is removed', async function () {
        const receipt = await roles.removeTemplater(templater, { from: owner });
        expectEvent(receipt, 'RoleRevoked', { account: templater });
      });

      it('random address should not be able to remove a templater', async function () {
        await expectRevert(roles.removeTemplater(templater, { from: random }), 'Caller is not an admin');
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
