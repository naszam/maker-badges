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
const pot = '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7'
const chief = '0x9eF05f7F6deB616fd37aC3c959a2dDD25A54E4F5'
const flipper = '0x0F398a2DaAa134621e4b687FCcfeE4CE47599Cc1'


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
});
