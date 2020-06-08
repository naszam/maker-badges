var MakerBadges = artifacts.require("MakerBadges");
var BadgeFactory = artifacts.require("BadgeFactory");

module.exports = function(deployer) { 
	deployer.deploy(MakerBadges).then(function() {
		return deployer.deploy(BadgeFactory, MakerBadges.address);
	});
};
