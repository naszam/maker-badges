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

const pot = '0xEA190DBDC7adF265260ec4dA6e9675Fd4f5A78bb'
const chief = '0xbBFFC76e94B34F72D96D054b31f6424249c1337d'
const flipper = '0xB40139Ea36D35d0C9F6a2e62601B616F1FfbBD1b'


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
