var MakerBadges = artifacts.require("MakerBadges");
var BadgeFactory = artifacts.require("BadgeFactory");
const kovan = require('./kovan');


module.exports = function(deployer) {
	deployer.deploy(MakerBadges, kovan.biconomy.forwarder, kovan.maker.chai, kovan.maker.chief, kovan.maker.flipper).then(function() {
		return deployer.deploy(BadgeFactory, kovan.biconomy.forwarder, MakerBadges.address);
	});
};
