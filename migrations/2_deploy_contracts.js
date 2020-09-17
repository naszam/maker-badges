var MakerBadges = artifacts.require("MakerBadges");
var BadgeFactory = artifacts.require("BadgeFactory");
var BadgePaymaster = artifacts.require("BadgePaymaster");
const kovan = require('./kovan');


module.exports = function(deployer) {
	deployer.deploy(MakerBadges, kovan.opengsn.trustedForwarder, kovan.maker.chai, kovan.maker.chief, kovan.maker.flipper).then(function() {
		return deployer.deploy(BadgeFactory, kovan.opengsn.trustedForwarder, MakerBadges.address);
	});

	deployer.deploy(BadgePaymaster);
};
