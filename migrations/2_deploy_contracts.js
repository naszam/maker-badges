var MakerBadges = artifacts.require("MakerBadges");
var BadgeFactory = artifacts.require("BadgeFactory");
const kovan = require('./maker');


module.exports = function(deployer) {
	deployer.deploy(MakerBadges, kovan.maker.pot, kovan.maker.chief, kovan.maker.flipper).then(function() {
		return deployer.deploy(BadgeFactory, MakerBadges.address);
	});
};
